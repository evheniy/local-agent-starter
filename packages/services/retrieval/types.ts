import type { RetrievedRagChunk } from '../postgres/index.js';

export type RagSource = {
  documentTitle: string;
  path: string;
  chunkIndex: number;
  score: number;
  content: string;
};

export type RetrieveRelevantChunksInput = {
  message: string;
  limit?: number;
};

export type RetrieveRelevantChunksType = (input: RetrieveRelevantChunksInput) => Promise<RagSource[]>;

export type RetrieveRelevantChunksDependencies = {
  createEmbedding: (input: string) => Promise<number[]>;
  searchRagChunks: (input: { embedding: number[]; limit: number }) => Promise<RetrievedRagChunk[]>;
};
