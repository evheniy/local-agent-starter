import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('services public API', () => {
  it('exports postgres services', () => {
    expect(publicApi.createClient).toBeDefined();
    expect(publicApi.createRagChunk).toBeDefined();
    expect(publicApi.createRagDocument).toBeDefined();
    expect(publicApi.createUploadedFile).toBeDefined();
    expect(publicApi.deleteRagDocumentByFileId).toBeDefined();
    expect(publicApi.ensureRagIndexSchema).toBeDefined();
    expect(publicApi.ensureUploadedFilesSchema).toBeDefined();
    expect(publicApi.getUploadedFileById).toBeDefined();
    expect(publicApi.getUploadedFileByPath).toBeDefined();
    expect(publicApi.listUploadedFiles).toBeDefined();
    expect(publicApi.markUploadedFileIndexed).toBeDefined();
    expect(publicApi.updateUploadedFileStatus).toBeDefined();
  });

  it('exports fs services', () => {
    expect(publicApi.createUploadedFileTarget).toBeDefined();
    expect(publicApi.saveUploadedFile).toBeDefined();
  });

  it('exports embedding services', () => {
    expect(publicApi.createEmbedding).toBeDefined();
    expect(publicApi.createEmbeddingsUrl).toBeDefined();
    expect(publicApi.validateEmbedding).toBeDefined();
  });

  it('exports document services', () => {
    expect(publicApi.createIndexUploadedFile).toBeDefined();
    expect(publicApi.indexUploadedFile).toBeDefined();
    expect(publicApi.readUploadedFileText).toBeDefined();
    expect(publicApi.splitText).toBeDefined();
  });

  it('exports indexer services', () => {
    expect(publicApi.createProcessNextIndexJob).toBeDefined();
    expect(publicApi.processNextIndexJob).toBeDefined();
  });
});
