import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./retrieveRelevantChunks.js', () => ({
  createRetrieveRelevantChunks: jest.fn(),
  normalizeRetrievalLimit: jest.fn(),
  retrieveRelevantChunks: jest.fn(),
}));

describe('retrieval service public API', () => {
  it('re-exports retrieval helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.createRetrieveRelevantChunks).toBeDefined();
    expect(publicApi.normalizeRetrievalLimit).toBeDefined();
    expect(publicApi.retrieveRelevantChunks).toBeDefined();
  });
});
