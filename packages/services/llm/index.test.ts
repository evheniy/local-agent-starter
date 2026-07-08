import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./createChatCompletion.js', () => ({
  createChatCompletion: jest.fn(),
}));

jest.mock('./createChatCompletionsUrl.js', () => ({
  createChatCompletionsUrl: jest.fn(),
}));

jest.mock('./streamChatCompletion.js', () => ({
  streamChatCompletion: jest.fn(),
}));

jest.mock('./validateChatCompletion.js', () => ({
  validateChatCompletion: jest.fn(),
}));

describe('llm service public API', () => {
  it('re-exports LLM helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.createChatCompletion).toBeDefined();
    expect(publicApi.createChatCompletionsUrl).toBeDefined();
    expect(publicApi.streamChatCompletion).toBeDefined();
    expect(publicApi.validateChatCompletion).toBeDefined();
  });
});
