import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./actions.js', () => ({
  claimNextRagIndexJob: jest.fn(),
  completeRagIndexJob: jest.fn(),
  createRagChunk: jest.fn(),
  createRagDocument: jest.fn(),
  createUploadedFile: jest.fn(),
  deleteRagDocumentByFileId: jest.fn(),
  enqueueRagIndexJob: jest.fn(),
  ensureRagIndexJobsSchema: jest.fn(),
  ensureRagIndexSchema: jest.fn(),
  ensureUploadedFilesSchema: jest.fn(),
  failRagIndexJob: jest.fn(),
  getUploadedFileById: jest.fn(),
  getUploadedFileByPath: jest.fn(),
  listUploadedFiles: jest.fn(),
  markUploadedFileIndexed: jest.fn(),
  updateUploadedFileStatus: jest.fn(),
}));

jest.mock('./client.js', () => ({
  closeClient: jest.fn(),
  createClient: jest.fn(),
  createClientConfig: jest.fn(),
  getClient: jest.fn(),
  query: jest.fn(),
}));

describe('postgres service public API', () => {
  it('re-exports client and action functions', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.closeClient).toBeDefined();
    expect(publicApi.claimNextRagIndexJob).toBeDefined();
    expect(publicApi.completeRagIndexJob).toBeDefined();
    expect(publicApi.createClient).toBeDefined();
    expect(publicApi.createClientConfig).toBeDefined();
    expect(publicApi.createRagChunk).toBeDefined();
    expect(publicApi.createRagDocument).toBeDefined();
    expect(publicApi.createUploadedFile).toBeDefined();
    expect(publicApi.deleteRagDocumentByFileId).toBeDefined();
    expect(publicApi.enqueueRagIndexJob).toBeDefined();
    expect(publicApi.ensureRagIndexJobsSchema).toBeDefined();
    expect(publicApi.ensureRagIndexSchema).toBeDefined();
    expect(publicApi.ensureUploadedFilesSchema).toBeDefined();
    expect(publicApi.failRagIndexJob).toBeDefined();
    expect(publicApi.getUploadedFileById).toBeDefined();
    expect(publicApi.getUploadedFileByPath).toBeDefined();
    expect(publicApi.getClient).toBeDefined();
    expect(publicApi.listUploadedFiles).toBeDefined();
    expect(publicApi.markUploadedFileIndexed).toBeDefined();
    expect(publicApi.query).toBeDefined();
    expect(publicApi.updateUploadedFileStatus).toBeDefined();
  });
});
