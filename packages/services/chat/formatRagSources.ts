import type { RagChatSource } from './types.js';
import type { RagSource } from '../retrieval/index.js';

const CONTENT_PREVIEW_LENGTH = 240;

export const createContentPreview = (content: string): string => {
  const normalized = content.replace(/\s+/gu, ' ').trim();

  return normalized.length > CONTENT_PREVIEW_LENGTH
    ? `${normalized.slice(0, CONTENT_PREVIEW_LENGTH - 1)}...`
    : normalized;
};

export const formatRagSources = (chunks: RagSource[]): RagChatSource[] =>
  chunks.map((chunk) => ({
    documentTitle: chunk.documentTitle,
    path: chunk.path,
    chunkIndex: chunk.chunkIndex,
    score: chunk.score,
    contentPreview: createContentPreview(chunk.content),
  }));
