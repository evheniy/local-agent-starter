import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./createEmbedding.js', () => ({
  createEmbedding: jest.fn(),
}));

jest.mock('./createEmbeddingsUrl.js', () => ({
  createEmbeddingsUrl: jest.fn(),
}));

jest.mock('./validateEmbedding.js', () => ({
  validateEmbedding: jest.fn(),
}));

describe('embeddings service public API', () => {
  it('re-exports embedding helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.createEmbedding).toBeDefined();
    expect(publicApi.createEmbeddingsUrl).toBeDefined();
    expect(publicApi.validateEmbedding).toBeDefined();
  });
});
