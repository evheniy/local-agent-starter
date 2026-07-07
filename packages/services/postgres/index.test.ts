import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./actions.js', () => ({
  createUploadedFile: jest.fn(),
  ensureUploadedFilesSchema: jest.fn(),
  getUploadedFileByPath: jest.fn(),
  listUploadedFiles: jest.fn(),
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
    expect(publicApi.createClient).toBeDefined();
    expect(publicApi.createClientConfig).toBeDefined();
    expect(publicApi.createUploadedFile).toBeDefined();
    expect(publicApi.ensureUploadedFilesSchema).toBeDefined();
    expect(publicApi.getUploadedFileByPath).toBeDefined();
    expect(publicApi.getClient).toBeDefined();
    expect(publicApi.listUploadedFiles).toBeDefined();
    expect(publicApi.query).toBeDefined();
  });
});
