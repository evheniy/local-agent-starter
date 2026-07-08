import { describe, expect, it, jest } from '@jest/globals';

import { createStreamRagChat } from './streamRagChat.js';

import type { StreamRagChatDependencies, RagChatStreamEvent } from './types.js';

const collect = async (stream: AsyncGenerator<RagChatStreamEvent>): Promise<RagChatStreamEvent[]> => {
  const events: RagChatStreamEvent[] = [];

  for await (const event of stream) {
    events.push(event);
  }

  return events;
};

describe('streamRagChat', () => {
  it('retrieves sources before streaming answer deltas and done', async () => {
    const dependencies: StreamRagChatDependencies = {
      retrieveRelevantChunks: jest.fn(() =>
        Promise.resolve([
          {
            documentTitle: 'README.md',
            path: 'docs/README.md',
            chunkIndex: 0,
            score: 0.82,
            content: 'Relevant context.',
          },
        ]),
      ),
      streamChatCompletion: jest.fn(async function* () {
        await Promise.resolve();
        yield 'Hello';
        yield ' world';
      }),
    };

    await expect(collect(createStreamRagChat(dependencies)({ message: 'What?', limit: 2 }))).resolves.toEqual([
      {
        type: 'sources',
        sources: [
          {
            documentTitle: 'README.md',
            path: 'docs/README.md',
            chunkIndex: 0,
            score: 0.82,
            contentPreview: 'Relevant context.',
          },
        ],
      },
      {
        type: 'answer_delta',
        text: 'Hello',
      },
      {
        type: 'answer_delta',
        text: ' world',
      },
      {
        type: 'done',
        ok: true,
      },
    ]);
    expect(dependencies.retrieveRelevantChunks).toHaveBeenCalledWith({
      message: 'What?',
      limit: 2,
    });
    expect(dependencies.streamChatCompletion).toHaveBeenCalledWith({
      messages: expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining('Relevant context.'),
        }),
      ]),
    });
  });

  it('streams an empty sources event when no chunks are found', async () => {
    const dependencies: StreamRagChatDependencies = {
      retrieveRelevantChunks: jest.fn(() => Promise.resolve([])),
      streamChatCompletion: jest.fn(async function* () {
        await Promise.resolve();
        yield 'No indexed content found.';
      }),
    };

    await expect(collect(createStreamRagChat(dependencies)({ message: 'Missing?' }))).resolves.toEqual([
      {
        type: 'sources',
        sources: [],
      },
      {
        type: 'answer_delta',
        text: 'No indexed content found.',
      },
      {
        type: 'done',
        ok: true,
      },
    ]);
  });

  it('streams an error event when retrieval fails', async () => {
    const dependencies: StreamRagChatDependencies = {
      retrieveRelevantChunks: jest.fn(() => Promise.reject(new Error('Postgres offline.'))),
      streamChatCompletion: jest.fn(async function* () {
        await Promise.resolve();
        yield 'never';
      }),
    };

    await expect(collect(createStreamRagChat(dependencies)({ message: 'What?' }))).resolves.toEqual([
      {
        type: 'error',
        ok: false,
        error: 'Postgres offline.',
      },
    ]);
    expect(dependencies.streamChatCompletion).not.toHaveBeenCalled();
  });

  it('streams an error event when LLM streaming fails', async () => {
    const dependencies: StreamRagChatDependencies = {
      retrieveRelevantChunks: jest.fn(() => Promise.resolve([])),
      streamChatCompletion: jest.fn(async function* () {
        const shouldThrow = true;

        await Promise.resolve();
        if (shouldThrow) {
          throw new Error('LLM offline.');
        }

        yield 'never';
      }),
    };

    await expect(collect(createStreamRagChat(dependencies)({ message: 'What?' }))).resolves.toEqual([
      {
        type: 'sources',
        sources: [],
      },
      {
        type: 'error',
        ok: false,
        error: 'LLM offline.',
      },
    ]);
  });

  it('streams a generic error for non-error failures', async () => {
    const dependencies: StreamRagChatDependencies = {
      retrieveRelevantChunks: jest.fn(() => {
        throw Object.assign(Object.create(null), { reason: 'offline' });
      }),
      streamChatCompletion: jest.fn(async function* () {
        await Promise.resolve();
        yield 'never';
      }),
    };

    await expect(collect(createStreamRagChat(dependencies)({ message: 'What?' }))).resolves.toEqual([
      {
        type: 'error',
        ok: false,
        error: 'Streaming chat request failed.',
      },
    ]);
  });
});
