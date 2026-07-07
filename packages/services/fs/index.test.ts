import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./actions.js', () => ({
  createUploadedFileTarget: jest.fn(),
  saveUploadedFile: jest.fn(),
}));

describe('fs service public API', () => {
  it('re-exports action functions', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.createUploadedFileTarget).toBeDefined();
    expect(publicApi.saveUploadedFile).toBeDefined();
  });
});
