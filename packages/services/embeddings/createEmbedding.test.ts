import { describe, expect, it, jest } from '@jest/globals';

import { createEmbedding } from './createEmbedding.js';

const createResponse = (options: { ok: boolean; status?: number; body?: unknown; text?: string }): Response =>
  ({
    ok: options.ok,
    status: options.status ?? 200,
    json: jest.fn(() => Promise.resolve(options.body)),
    text: jest.fn(() => Promise.resolve(options.text ?? 'failed')),
  }) as unknown as Response;

describe('createEmbedding', () => {
  it('creates an embedding from an OpenAI-compatible response', async () => {
    const fetchEmbedding = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            data: [
              {
                embedding: [
                  0.1,
                  0.2,
                ],
              },
            ],
          },
        }),
      ),
    );

    await expect(
      createEmbedding({
        input: 'hello',
        baseUrl: 'http://localhost:1234/',
        model: 'embedding-model',
        dimensions: 2,
        fetch: fetchEmbedding,
      }),
    ).resolves.toEqual([
      0.1,
      0.2,
    ]);
    expect(fetchEmbedding).toHaveBeenCalledWith('http://localhost:1234/v1/embeddings', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'embedding-model',
        input: 'hello',
      }),
    });
  });

  it('throws for non-200 responses', async () => {
    const fetchEmbedding = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: false,
          status: 503,
          text: 'offline',
        }),
      ),
    );

    await expect(
      createEmbedding({
        input: 'hello',
        dimensions: 2,
        fetch: fetchEmbedding,
      }),
    ).rejects.toThrow('Embedding request failed with 503: offline');
  });

  it('throws when the response does not include an embedding', async () => {
    const fetchEmbedding = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            data: [{}],
          },
        }),
      ),
    );

    await expect(
      createEmbedding({
        input: 'hello',
        dimensions: 2,
        fetch: fetchEmbedding,
      }),
    ).rejects.toThrow('Embedding is required.');
  });

  it('throws when the embedding dimension does not match', async () => {
    const fetchEmbedding = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            data: [
              {
                embedding: [0.1],
              },
            ],
          },
        }),
      ),
    );

    await expect(
      createEmbedding({
        input: 'hello',
        dimensions: 2,
        fetch: fetchEmbedding,
      }),
    ).rejects.toThrow('Embedding dimension mismatch: expected 2, got 1');
  });

  it('uses environment defaults when model and base URL are not provided', async () => {
    const previousModel = process.env.EMBEDDING_MODEL;
    const previousBaseUrl = process.env.EMBEDDING_BASE_URL;
    const previousDimensions = process.env.EMBEDDING_DIMENSIONS;
    const fetchEmbedding = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            data: [
              {
                embedding: [
                  0.1,
                  0.2,
                  0.3,
                ],
              },
            ],
          },
        }),
      ),
    );

    try {
      process.env.EMBEDDING_MODEL = 'env-model';
      process.env.EMBEDDING_BASE_URL = 'http://env.local/v1';
      process.env.EMBEDDING_DIMENSIONS = '3';

      await expect(
        createEmbedding({
          input: 'hello',
          fetch: fetchEmbedding,
        }),
      ).resolves.toEqual([
        0.1,
        0.2,
        0.3,
      ]);
      expect(fetchEmbedding).toHaveBeenCalledWith(
        'http://env.local/v1/embeddings',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'env-model',
            input: 'hello',
          }),
        }),
      );
    } finally {
      if (previousModel === undefined) {
        delete process.env.EMBEDDING_MODEL;
      } else {
        process.env.EMBEDDING_MODEL = previousModel;
      }

      if (previousBaseUrl === undefined) {
        delete process.env.EMBEDDING_BASE_URL;
      } else {
        process.env.EMBEDDING_BASE_URL = previousBaseUrl;
      }

      if (previousDimensions === undefined) {
        delete process.env.EMBEDDING_DIMENSIONS;
      } else {
        process.env.EMBEDDING_DIMENSIONS = previousDimensions;
      }
    }
  });

  it('uses built-in defaults when embedding environment variables are missing', async () => {
    const previousModel = process.env.EMBEDDING_MODEL;
    const previousBaseUrl = process.env.EMBEDDING_BASE_URL;
    const previousDimensions = process.env.EMBEDDING_DIMENSIONS;
    const fetchEmbedding = jest.fn<typeof fetch>(() =>
      Promise.resolve(
        createResponse({
          ok: true,
          body: {
            data: [
              {
                embedding: [
                  0.1,
                  0.2,
                ],
              },
            ],
          },
        }),
      ),
    );

    try {
      delete process.env.EMBEDDING_MODEL;
      delete process.env.EMBEDDING_BASE_URL;
      process.env.EMBEDDING_DIMENSIONS = '2';

      await expect(
        createEmbedding({
          input: 'hello',
          fetch: fetchEmbedding,
        }),
      ).resolves.toEqual([
        0.1,
        0.2,
      ]);
      expect(fetchEmbedding).toHaveBeenCalledWith(
        'http://host.docker.internal:1234/v1/embeddings',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'text-embedding-qwen3-embedding-0.6b',
            input: 'hello',
          }),
        }),
      );
    } finally {
      if (previousModel === undefined) {
        delete process.env.EMBEDDING_MODEL;
      } else {
        process.env.EMBEDDING_MODEL = previousModel;
      }

      if (previousBaseUrl === undefined) {
        delete process.env.EMBEDDING_BASE_URL;
      } else {
        process.env.EMBEDDING_BASE_URL = previousBaseUrl;
      }

      if (previousDimensions === undefined) {
        delete process.env.EMBEDDING_DIMENSIONS;
      } else {
        process.env.EMBEDDING_DIMENSIONS = previousDimensions;
      }
    }
  });
});
