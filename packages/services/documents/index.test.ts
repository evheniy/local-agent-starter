import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./indexUploadedFile.js', () => ({
  createIndexUploadedFile: jest.fn(),
  indexUploadedFile: jest.fn(),
}));

jest.mock('./readUploadedFileText.js', () => ({
  readUploadedFileText: jest.fn(),
  UnsupportedFileTypeError: class UnsupportedFileTypeError extends Error {},
}));

jest.mock('./splitText.js', () => ({
  splitText: jest.fn(),
}));

describe('documents service public API', () => {
  it('re-exports document helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.createIndexUploadedFile).toBeDefined();
    expect(publicApi.indexUploadedFile).toBeDefined();
    expect(publicApi.readUploadedFileText).toBeDefined();
    expect(publicApi.splitText).toBeDefined();
    expect(publicApi.UnsupportedFileTypeError).toBeDefined();
  });
});
