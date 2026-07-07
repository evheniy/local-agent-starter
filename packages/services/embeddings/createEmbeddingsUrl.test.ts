import { describe, expect, it } from '@jest/globals';

import { createEmbeddingsUrl } from './createEmbeddingsUrl.js';

describe('createEmbeddingsUrl', () => {
  it('appends the OpenAI embeddings path to a base URL without a slash', () => {
    expect(createEmbeddingsUrl('http://localhost:1234')).toBe('http://localhost:1234/v1/embeddings');
  });

  it('removes a trailing slash before appending the embeddings path', () => {
    expect(createEmbeddingsUrl('http://localhost:1234/')).toBe('http://localhost:1234/v1/embeddings');
  });

  it('does not duplicate the v1 segment', () => {
    expect(createEmbeddingsUrl('http://localhost:1234/v1')).toBe('http://localhost:1234/v1/embeddings');
  });
});
