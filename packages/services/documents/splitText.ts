import type { SplitTextOptions, TextChunk } from './types.js';

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

const normalizeText = (text: string) =>
  text
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n')
    .replace(/\n{3,}/gu, '\n\n')
    .trim();

/** Splits plain text into ordered overlapping character chunks. */
export const splitText = (text: string, options: SplitTextOptions = {}): TextChunk[] => {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_CHUNK_OVERLAP;

  if (chunkSize <= 0) {
    throw new Error('chunkSize must be > 0');
  }

  if (overlap < 0) {
    throw new Error('overlap must be >= 0');
  }

  if (overlap >= chunkSize) {
    throw new Error('overlap must be smaller than chunkSize');
  }

  const normalizedText = normalizeText(text);

  if (!normalizedText) {
    return [];
  }

  const chunks: TextChunk[] = [];
  let startOffset = 0;

  while (startOffset < normalizedText.length) {
    const endOffset = Math.min(startOffset + chunkSize, normalizedText.length);
    const content = normalizedText.slice(startOffset, endOffset);

    if (content.trim()) {
      chunks.push({
        index: chunks.length,
        content,
        startOffset,
        endOffset,
      });
    }

    if (endOffset === normalizedText.length) {
      break;
    }

    startOffset = endOffset - overlap;
  }

  return chunks;
};
