import { afterEach, describe, expect, it } from '@jest/globals';

import { getChatBaseUrl } from './get-chat-base-url.js';

describe('getChatBaseUrl', () => {
  const previousApi = process.env.API;
  const previousChat = process.env.CHAT;

  afterEach(() => {
    if (previousApi === undefined) {
      delete process.env.API;
    } else {
      process.env.API = previousApi;
    }

    if (previousChat === undefined) {
      delete process.env.CHAT;
    } else {
      process.env.CHAT = previousChat;
    }
  });

  it('uses CHAT when configured', () => {
    process.env.API = 'http://localhost:3000';
    process.env.CHAT = 'http://localhost:3002';

    expect(getChatBaseUrl()).toBe('http://localhost:3002');
  });

  it('falls back to API and then browser origin', () => {
    delete process.env.CHAT;
    process.env.API = 'http://localhost:3000';

    expect(getChatBaseUrl()).toBe('http://localhost:3000');

    delete process.env.API;

    expect(getChatBaseUrl()).toBe('http://localhost');
  });
});
