import { describe, expect, it, jest } from '@jest/globals';
import type { HandlerParams } from '@vyriy/router';

import { createChatHandler } from './chat.js';

import type { RagChatType } from '@p/services';

describe('chat handler', () => {
  const createParams = (body: unknown): HandlerParams =>
    ({
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }) as HandlerParams;

  it('rejects missing messages', async () => {
    const ragChat = jest.fn<RagChatType>();
    const chat = createChatHandler({ ragChat });

    await expect(chat(createParams({ message: '   ' }))).resolves.toEqual({
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        error: 'message is required.',
      }),
    });
    expect(ragChat).not.toHaveBeenCalled();
  });

  it('rejects empty bodies as missing messages', async () => {
    const chat = createChatHandler({
      ragChat: jest.fn<RagChatType>(),
    });

    await expect(chat({ body: undefined } as HandlerParams)).resolves.toEqual({
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        error: 'message is required.',
      }),
    });
  });

  it('rejects invalid JSON', async () => {
    const chat = createChatHandler({
      ragChat: jest.fn<RagChatType>(),
    });

    await expect(chat(createParams('{'))).resolves.toEqual({
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        error: 'Request body must be valid JSON.',
      }),
    });
  });

  it('rejects non-object JSON bodies as missing messages', async () => {
    const chat = createChatHandler({
      ragChat: jest.fn<RagChatType>(),
    });

    await expect(chat(createParams('"hello"'))).resolves.toEqual({
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        error: 'message is required.',
      }),
    });
  });

  it('rejects invalid limits', async () => {
    const chat = createChatHandler({
      ragChat: jest.fn<RagChatType>(),
    });

    await expect(chat(createParams({ message: 'Hello', limit: 0 }))).resolves.toEqual({
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        error: 'limit must be a positive number.',
      }),
    });
  });

  it('returns a RAG answer and sources', async () => {
    const ragChat = jest.fn<RagChatType>(() =>
      Promise.resolve({
        answer: 'Answer. [1]',
        sources: [
          {
            documentTitle: 'Notes',
            path: 'docs/notes.md',
            chunkIndex: 0,
            score: 0.82,
            contentPreview: 'Relevant content.',
          },
        ],
      }),
    );
    const chat = createChatHandler({ ragChat });

    await expect(chat(createParams({ message: ' Hello ', limit: 2 }))).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        answer: 'Answer. [1]',
        sources: [
          {
            documentTitle: 'Notes',
            path: 'docs/notes.md',
            chunkIndex: 0,
            score: 0.82,
            contentPreview: 'Relevant content.',
          },
        ],
      }),
    });
    expect(ragChat).toHaveBeenCalledWith({
      message: 'Hello',
      limit: 2,
    });
  });

  it('returns ok false when chat fails', async () => {
    const chat = createChatHandler({
      ragChat: jest.fn<RagChatType>(() => Promise.reject(new Error('LLM offline.'))),
    });

    await expect(chat(createParams({ message: 'Hello' }))).resolves.toEqual({
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: 'LLM offline.',
      }),
    });
  });

  it('returns a generic error when chat throws a non-error value', async () => {
    const chat = createChatHandler({
      ragChat: jest.fn<RagChatType>(() => {
        throw Object.assign(Object.create(null), { reason: 'offline' });
      }),
    });

    await expect(chat(createParams({ message: 'Hello' }))).resolves.toEqual({
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: 'Chat request failed.',
      }),
    });
  });
});
