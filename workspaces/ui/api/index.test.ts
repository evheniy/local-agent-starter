import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./chat-stream.js', () => ({
  streamChat: jest.fn(),
}));

jest.mock('./files.js', () => ({
  listFiles: jest.fn(),
  uploadFile: jest.fn(),
}));

describe('ui API public exports', () => {
  it('exports API helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.listFiles).toBeDefined();
    expect(publicApi.streamChat).toBeDefined();
    expect(publicApi.uploadFile).toBeDefined();
  });
});
