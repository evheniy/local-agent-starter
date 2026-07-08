import { describe, expect, it, jest } from '@jest/globals';
import { ReadableStream } from 'node:stream/web';

import { streamChatCompletion } from './streamChatCompletion.js';

const encoder = new TextEncoder();

const createBody = (chunks: string[]): ReadableStream<Uint8Array> =>
  new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }

      controller.close();
    },
  });

const createResponse = (options: {
  ok: boolean;
  status?: number;
  body?: ReadableStream<Uint8Array> | null;
  text?: string;
}): Response =>
  ({
    body: options.body,
    ok: options.ok,
    status: options.status ?? 200,
    text: jest.fn(() => Promise.resolve(options.text ?? 'failed')),
  }) as unknown as Response;

const collect = async (stream: AsyncGenerator<string>): Promise<string[]> => {
  const deltas: string[] = [];

  for await (const delta of stream) {
    deltas.push(delta);
  }

  return deltas;
};

describe('streamChatCompletion', () => {
  it('streams deltas from an OpenAI-compatible SSE response', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody([
            'data: {"choices":[{"delta":{"content":"Hel"}}]}\n\n',
            'data: {"choices":[{"delta":{"content":"lo"}}]}\n\n',
            'data: [DONE]\n\n',
          ]),
        }),
      ),
    );
    const messages = [
      {
        role: 'user' as const,
        content: 'Hello?',
      },
    ];

    await expect(
      collect(
        streamChatCompletion({
          messages,
          baseUrl: 'http://localhost:1234/v1',
          model: 'chat-model',
          fetch: fetchCompletion,
        }),
      ),
    ).resolves.toEqual([
      'Hel',
      'lo',
    ]);
    expect(fetchCompletion).toHaveBeenCalledWith('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'chat-model',
        messages,
        stream: true,
      }),
    });
  });

  it('handles split SSE lines and empty delta chunks', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody([
            'data: {"choices":[{"delta":{}}]}\n\n',
            'data: {"choices":[{"delta":{"content":"sp',
            'lit"}}]}\n\n',
          ]),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).resolves.toEqual(['split']);
  });

  it('ignores empty data lines', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data:   \n\n']),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).resolves.toEqual([]);
  });

  it('stops reading when the stream sends DONE without closing the connection', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            },
          }),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).resolves.toEqual([]);
  });

  it('stops reading after an idle timeout once stream chunks have arrived', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: new ReadableStream({
            start(controller) {
              controller.enqueue(encoder.encode('data: {"choices":[{"delta":{"content":"done"}}]}\n\n'));
            },
          }),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
          streamIdleMs: 1,
        }),
      ),
    ).resolves.toEqual(['done']);
  });

  it('handles a final SSE line without a trailing newline', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data: {"choices":[{"delta":{"content":"final"}}]}']),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).resolves.toEqual(['final']);
  });

  it('handles a final DONE line without a trailing newline', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data: [DONE]']),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).resolves.toEqual([]);
  });

  it('ignores a final SSE line without delta content', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data: {"choices":[{"delta":{}}]}']),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).resolves.toEqual([]);
  });

  it('throws for non-200 responses', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: false,
          status: 503,
          text: 'offline',
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).rejects.toThrow('Chat completion stream request failed with 503: offline');
  });

  it('throws when response body is missing', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: null,
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).rejects.toThrow('Chat completion stream response did not include a body.');
  });

  it('throws for malformed stream chunks', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data: {"choices":[{"delta":{"content":1}}]}\n\n']),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).rejects.toThrow('Chat completion stream delta content must be a string.');
  });

  it('throws for invalid stream JSON', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data: nope\n\n']),
        }),
      ),
    );

    await expect(
      collect(
        streamChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ),
    ).rejects.toThrow('Chat completion stream returned invalid JSON.');
  });

  it('uses environment defaults when model and base URL are not provided', async () => {
    const previousModel = process.env.LLM_MODEL;
    const previousBaseUrl = process.env.LLM_BASE_URL;
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data: [DONE]\n\n']),
        }),
      ),
    );

    try {
      process.env.LLM_MODEL = 'env-chat-model';
      process.env.LLM_BASE_URL = 'http://env.local/v1';

      await expect(
        collect(
          streamChatCompletion({
            messages: [],
            fetch: fetchCompletion,
          }),
        ),
      ).resolves.toEqual([]);
      expect(fetchCompletion).toHaveBeenCalledWith(
        'http://env.local/v1/chat/completions',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'env-chat-model',
            messages: [],
            stream: true,
          }),
        }),
      );
    } finally {
      if (previousModel === undefined) {
        delete process.env.LLM_MODEL;
      } else {
        process.env.LLM_MODEL = previousModel;
      }

      if (previousBaseUrl === undefined) {
        delete process.env.LLM_BASE_URL;
      } else {
        process.env.LLM_BASE_URL = previousBaseUrl;
      }
    }
  });

  it('uses built-in defaults when LLM environment variables are missing', async () => {
    const previousModel = process.env.LLM_MODEL;
    const previousBaseUrl = process.env.LLM_BASE_URL;
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: createBody(['data: [DONE]\n\n']),
        }),
      ),
    );

    try {
      delete process.env.LLM_MODEL;
      delete process.env.LLM_BASE_URL;

      await expect(
        collect(
          streamChatCompletion({
            messages: [],
            fetch: fetchCompletion,
          }),
        ),
      ).resolves.toEqual([]);
      expect(fetchCompletion).toHaveBeenCalledWith(
        'http://host.docker.internal:1234/v1/chat/completions',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'local-model',
            messages: [],
            stream: true,
          }),
        }),
      );
    } finally {
      if (previousModel === undefined) {
        delete process.env.LLM_MODEL;
      } else {
        process.env.LLM_MODEL = previousModel;
      }

      if (previousBaseUrl === undefined) {
        delete process.env.LLM_BASE_URL;
      } else {
        process.env.LLM_BASE_URL = previousBaseUrl;
      }
    }
  });
});
