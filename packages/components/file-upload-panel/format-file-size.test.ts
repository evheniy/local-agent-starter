import { describe, expect, it } from '@jest/globals';

import { formatFileSize } from './format-file-size.js';

describe('formatFileSize', () => {
  it('formats byte values below one kilobyte', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('formats kilobyte values with one decimal place', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });
});
