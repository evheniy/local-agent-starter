import { describe, expect, it } from '@jest/globals';

import { createChatCompletionsUrl } from './createChatCompletionsUrl.js';

describe('createChatCompletionsUrl', () => {
  it('normalizes OpenAI-compatible chat completions URLs', () => {
    expect(createChatCompletionsUrl('http://localhost:1234/')).toBe('http://localhost:1234/v1/chat/completions');
    expect(createChatCompletionsUrl('http://localhost:1234/v1')).toBe('http://localhost:1234/v1/chat/completions');
  });
});
