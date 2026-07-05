import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('indexed-files-list public API', () => {
  it('exports IndexedFilesList', () => {
    expect(publicApi.IndexedFilesList).toBeDefined();
  });
});
