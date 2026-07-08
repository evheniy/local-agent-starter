import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./stream-chat-response.js', () => ({
  streamChatResponse: jest.fn(),
}));

describe('ui public API', () => {
  it('exports API helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.dispatchStreamEvent).toBeDefined();
    expect(publicApi.getApiBaseUrl).toBeDefined();
    expect(publicApi.getChatBaseUrl).toBeDefined();
    expect(publicApi.getUploadErrorMessage).toBeDefined();
    expect(publicApi.listFiles).toBeDefined();
    expect(publicApi.parseEventBlock).toBeDefined();
    expect(publicApi.processBufferedEvents).toBeDefined();
    expect(publicApi.requestJsonChat).toBeDefined();
    expect(publicApi.shouldFallbackToJsonChat).toBeDefined();
    expect(publicApi.streamChat).toBeDefined();
    expect(publicApi.streamChatResponse).toBeDefined();
    expect(publicApi.uploadFile).toBeDefined();
  });
});
