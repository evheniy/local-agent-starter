import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('file-upload-panel public API', () => {
  it('exports FileUploadPanel', () => {
    expect(publicApi.FileUploadPanel).toBeDefined();
  });
});
