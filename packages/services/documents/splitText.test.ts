import { describe, expect, it } from '@jest/globals';

import { splitText } from './splitText.js';

describe('splitText', () => {
  it('returns no chunks for empty text', () => {
    expect(splitText('')).toEqual([]);
  });

  it('returns one chunk for short text', () => {
    expect(splitText('hello\r\n\r\n\r\nworld', { chunkSize: 20, overlap: 5 })).toEqual([
      {
        index: 0,
        content: 'hello\n\nworld',
        startOffset: 0,
        endOffset: 12,
      },
    ]);
  });

  it('returns multiple chunks for long text', () => {
    expect(splitText('abcdefghij', { chunkSize: 4, overlap: 0 })).toEqual([
      {
        index: 0,
        content: 'abcd',
        startOffset: 0,
        endOffset: 4,
      },
      {
        index: 1,
        content: 'efgh',
        startOffset: 4,
        endOffset: 8,
      },
      {
        index: 2,
        content: 'ij',
        startOffset: 8,
        endOffset: 10,
      },
    ]);
  });

  it('overlaps neighboring chunks', () => {
    expect(splitText('abcdef', { chunkSize: 4, overlap: 2 })).toEqual([
      {
        index: 0,
        content: 'abcd',
        startOffset: 0,
        endOffset: 4,
      },
      {
        index: 1,
        content: 'cdef',
        startOffset: 2,
        endOffset: 6,
      },
    ]);
  });

  it('throws when chunkSize is invalid', () => {
    expect(() => splitText('hello', { chunkSize: 0 })).toThrow('chunkSize must be > 0');
  });

  it('throws when overlap is negative', () => {
    expect(() => splitText('hello', { overlap: -1 })).toThrow('overlap must be >= 0');
  });

  it('throws when overlap is not smaller than chunkSize', () => {
    expect(() => splitText('hello', { chunkSize: 4, overlap: 4 })).toThrow('overlap must be smaller than chunkSize');
  });
});
