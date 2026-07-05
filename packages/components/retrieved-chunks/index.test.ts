import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('retrieved-chunks public API', () => {
  it('exports RetrievedChunks', () => {
    expect(publicApi.RetrievedChunks).toBeDefined();
  });
});
