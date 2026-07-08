import { describe, expect, it, jest } from '@jest/globals';

import { createRetrieveRelevantChunks, normalizeRetrievalLimit } from './retrieveRelevantChunks.js';

import type { RetrieveRelevantChunksDependencies } from './types.js';

describe('retrieveRelevantChunks', () => {
  it('creates a query embedding and searches chunks', async () => {
    const dependencies: RetrieveRelevantChunksDependencies = {
      createEmbedding: jest.fn(() => Promise.resolve([0.1, 0.2])),
      searchRagChunks: jest.fn(() =>
        Promise.resolve([
          {
            documentTitle: 'Notes',
            path: 'docs/notes.md',
            chunkIndex: 0,
            score: 0.82,
            content: 'hello',
          },
        ]),
      ),
    };

    await expect(createRetrieveRelevantChunks(dependencies)({ message: 'What?', limit: 3 })).resolves.toEqual([
      {
        documentTitle: 'Notes',
        path: 'docs/notes.md',
        chunkIndex: 0,
        score: 0.82,
        content: 'hello',
      },
    ]);
    expect(dependencies.createEmbedding).toHaveBeenCalledWith('What?');
    expect(dependencies.searchRagChunks).toHaveBeenCalledWith({
      embedding: [0.1, 0.2],
      limit: 3,
    });
  });

  it('normalizes missing and out-of-range limits', () => {
    expect(normalizeRetrievalLimit(undefined)).toBe(5);
    expect(normalizeRetrievalLimit(Number.NaN)).toBe(5);
    expect(normalizeRetrievalLimit(0)).toBe(1);
    expect(normalizeRetrievalLimit(21)).toBe(20);
    expect(normalizeRetrievalLimit(2.9)).toBe(2);
  });
});
