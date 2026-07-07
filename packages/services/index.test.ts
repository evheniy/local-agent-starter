import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('services public API', () => {
  it('exports postgres services', () => {
    expect(publicApi.createClient).toBeDefined();
    expect(publicApi.createUploadedFile).toBeDefined();
    expect(publicApi.ensureUploadedFilesSchema).toBeDefined();
    expect(publicApi.getUploadedFileByPath).toBeDefined();
    expect(publicApi.listUploadedFiles).toBeDefined();
  });

  it('exports fs services', () => {
    expect(publicApi.createUploadedFileTarget).toBeDefined();
    expect(publicApi.saveUploadedFile).toBeDefined();
  });
});
