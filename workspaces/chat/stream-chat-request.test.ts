import { describe, expect, it } from '@jest/globals';

import { parseStreamChatRequest } from './stream-chat-request.js';

describe('parseStreamChatRequest', () => {
  it('parses message and default limit', () => {
    expect(parseStreamChatRequest(JSON.stringify({ message: ' hello ' }))).toEqual({
      message: 'hello',
      limit: 5,
    });
  });

  it('parses explicit limits', () => {
    expect(parseStreamChatRequest(JSON.stringify({ message: 'hello', limit: 10 }))).toEqual({
      message: 'hello',
      limit: 10,
    });
  });

  it('rejects missing and empty messages', () => {
    expect(() => parseStreamChatRequest(undefined)).toThrow('message is required.');
    expect(() => parseStreamChatRequest(JSON.stringify({ message: '   ' }))).toThrow('message is required.');
  });

  it('rejects malformed and primitive JSON bodies', () => {
    expect(() => parseStreamChatRequest('{')).toThrow('Request body must be valid JSON.');
    expect(() => parseStreamChatRequest('1')).toThrow('message is required.');
  });

  it('rejects invalid limits', () => {
    expect(() => parseStreamChatRequest(JSON.stringify({ message: 'hello', limit: 1.5 }))).toThrow(
      'limit must be an integer from 1 to 10.',
    );
    expect(() => parseStreamChatRequest(JSON.stringify({ message: 'hello', limit: 0 }))).toThrow(
      'limit must be an integer from 1 to 10.',
    );
    expect(() => parseStreamChatRequest(JSON.stringify({ message: 'hello', limit: 11 }))).toThrow(
      'limit must be an integer from 1 to 10.',
    );
  });
});
