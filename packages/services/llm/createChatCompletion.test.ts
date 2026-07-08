import { describe, expect, it, jest } from '@jest/globals';

import { createChatCompletion } from './createChatCompletion.js';

const createResponse = (options: { ok: boolean; status?: number; body?: unknown; text?: string }): Response =>
  ({
    ok: options.ok,
    status: options.status ?? 200,
    json: jest.fn(() => Promise.resolve(options.body)),
    text: jest.fn(() => Promise.resolve(options.text ?? 'failed')),
  }) as unknown as Response;

describe('createChatCompletion', () => {
  it('creates a non-streaming chat completion', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            choices: [
              {
                message: {
                  content: 'Answer from context.',
                },
              },
            ],
          },
        }),
      ),
    );
    const messages = [
      {
        role: 'user' as const,
        content: 'Question?',
      },
    ];

    await expect(
      createChatCompletion({
        messages,
        baseUrl: 'http://localhost:1234/',
        model: 'chat-model',
        fetch: fetchCompletion,
      }),
    ).resolves.toBe('Answer from context.');
    expect(fetchCompletion).toHaveBeenCalledWith('http://localhost:1234/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'chat-model',
        messages,
        stream: false,
      }),
    });
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
      createChatCompletion({
        messages: [],
        fetch: fetchCompletion,
      }),
    ).rejects.toThrow('Chat completion request failed with 503: offline');
  });

  it('throws when the response does not include an answer', async () => {
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            choices: [{}],
          },
        }),
      ),
    );

    await expect(
      createChatCompletion({
        messages: [],
        fetch: fetchCompletion,
      }),
    ).rejects.toThrow('Chat completion response did not include an answer.');
  });

  it('uses environment defaults when model and base URL are not provided', async () => {
    const previousModel = process.env.LLM_MODEL;
    const previousBaseUrl = process.env.LLM_BASE_URL;
    const fetchCompletion = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            choices: [
              {
                message: {
                  content: 'Env answer.',
                },
              },
            ],
          },
        }),
      ),
    );

    try {
      process.env.LLM_MODEL = 'env-chat-model';
      process.env.LLM_BASE_URL = 'http://env.local/v1';

      await expect(
        createChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ).resolves.toBe('Env answer.');
      expect(fetchCompletion).toHaveBeenCalledWith(
        'http://env.local/v1/chat/completions',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'env-chat-model',
            messages: [],
            stream: false,
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
          body: {
            choices: [
              {
                message: {
                  content: 'Default answer.',
                },
              },
            ],
          },
        }),
      ),
    );

    try {
      delete process.env.LLM_MODEL;
      delete process.env.LLM_BASE_URL;

      await expect(
        createChatCompletion({
          messages: [],
          fetch: fetchCompletion,
        }),
      ).resolves.toBe('Default answer.');
      expect(fetchCompletion).toHaveBeenCalledWith(
        'http://host.docker.internal:1234/v1/chat/completions',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'local-model',
            messages: [],
            stream: false,
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
