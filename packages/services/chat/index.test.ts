import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./buildRagPrompt.js', () => ({
  NO_CONTEXT_ANSWER: 'No context.',
  buildRagPrompt: jest.fn(),
}));

jest.mock('./createRagChat.js', () => ({
  createRagChat: jest.fn(),
  ragChat: jest.fn(),
}));

jest.mock('./formatRagSources.js', () => ({
  createContentPreview: jest.fn(),
  formatRagSources: jest.fn(),
}));

jest.mock('./streamRagChat.js', () => ({
  createStreamRagChat: jest.fn(),
  streamRagChat: jest.fn(),
}));

describe('chat service public API', () => {
  it('re-exports chat helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.NO_CONTEXT_ANSWER).toBeDefined();
    expect(publicApi.buildRagPrompt).toBeDefined();
    expect(publicApi.createContentPreview).toBeDefined();
    expect(publicApi.createRagChat).toBeDefined();
    expect(publicApi.createStreamRagChat).toBeDefined();
    expect(publicApi.formatRagSources).toBeDefined();
    expect(publicApi.ragChat).toBeDefined();
    expect(publicApi.streamRagChat).toBeDefined();
  });
});
