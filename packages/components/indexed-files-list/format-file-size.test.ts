import { describe, expect, it } from '@jest/globals';

import { formatFileSize } from './format-file-size.js';

describe('formatFileSize', () => {
  it('returns a fallback for missing sizes', () => {
    expect(formatFileSize()).toBe('Unknown size');
  });

  it('formats byte values below one kilobyte', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('formats kilobyte values with one decimal place', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2048)).toBe('2.0 KB');
  });
});
