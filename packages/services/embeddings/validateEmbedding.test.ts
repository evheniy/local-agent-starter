import { describe, expect, it } from '@jest/globals';

import { validateEmbedding } from './validateEmbedding.js';

describe('validateEmbedding', () => {
  it('returns a numeric embedding when dimensions match', () => {
    expect(validateEmbedding([1, '2'], 2)).toEqual([
      1,
      2,
    ]);
  });

  it('throws when the embedding has the wrong dimension', () => {
    expect(() => validateEmbedding([1], 2)).toThrow('Embedding dimension mismatch: expected 2, got 1');
  });

  it('throws when the embedding is missing', () => {
    expect(() => validateEmbedding(undefined, 2)).toThrow('Embedding is required.');
  });

  it('throws when the embedding is empty', () => {
    expect(() => validateEmbedding([], 2)).toThrow('Embedding is required.');
  });

  it('throws when the embedding contains non-numeric values', () => {
    expect(() => validateEmbedding([1, 'nope'], 2)).toThrow('Embedding must contain only finite numbers.');
  });

  it('uses EMBEDDING_DIMENSIONS when dimensions are not provided', () => {
    const previousDimensions = process.env.EMBEDDING_DIMENSIONS;

    try {
      process.env.EMBEDDING_DIMENSIONS = '2';

      expect(
        validateEmbedding([
          1,
          2,
        ]),
      ).toEqual([
        1,
        2,
      ]);
    } finally {
      if (previousDimensions === undefined) {
        delete process.env.EMBEDDING_DIMENSIONS;
      } else {
        process.env.EMBEDDING_DIMENSIONS = previousDimensions;
      }
    }
  });

  it('defaults to 1024 dimensions when no env value is set', () => {
    const previousDimensions = process.env.EMBEDDING_DIMENSIONS;

    try {
      delete process.env.EMBEDDING_DIMENSIONS;

      expect(validateEmbedding(Array.from({ length: 1024 }, () => 0))).toHaveLength(1024);
    } finally {
      if (previousDimensions === undefined) {
        delete process.env.EMBEDDING_DIMENSIONS;
      } else {
        process.env.EMBEDDING_DIMENSIONS = previousDimensions;
      }
    }
  });
});
