import { describe, expect, it, jest } from '@jest/globals';

const createEmbedding = jest.fn((input: unknown) => {
  void input;

  return Promise.resolve([0.1, 0.2]);
});
const searchRagChunks = jest.fn((input: unknown) => {
  void input;

  return Promise.resolve([]);
});

jest.mock('../embeddings/index.js', () => ({
  createEmbedding,
}));

jest.mock('../postgres/index.js', () => ({
  searchRagChunks: () => searchRagChunks,
}));

describe('retrieveRelevantChunks defaults', () => {
  it('wires the default embedding service with message text input', async () => {
    const { retrieveRelevantChunks } = await import('./retrieveRelevantChunks.js');

    await expect(retrieveRelevantChunks({ message: 'Find this.' })).resolves.toEqual([]);
    expect(createEmbedding).toHaveBeenCalledWith({
      input: 'Find this.',
    });
    expect(searchRagChunks).toHaveBeenCalledWith({
      embedding: [0.1, 0.2],
      limit: 5,
    });
  });
});
