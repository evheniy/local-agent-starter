import { describe, expect, it } from '@jest/globals';

import { shouldFallbackToJsonChat } from './should-fallback-to-json-chat.js';

describe('shouldFallbackToJsonChat', () => {
  it('does not fall back for abort errors', () => {
    expect(shouldFallbackToJsonChat(new DOMException('aborted', 'AbortError'))).toBe(false);
  });

  it('falls back for other errors', () => {
    expect(shouldFallbackToJsonChat(new Error('offline'))).toBe(true);
    expect(shouldFallbackToJsonChat('offline')).toBe(true);
  });
});
