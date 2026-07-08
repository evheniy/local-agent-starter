import { createEmbedding as createStoredEmbedding } from '../embeddings/index.js';
import { searchRagChunks as searchStoredRagChunks } from '../postgres/index.js';

import type {
  RetrieveRelevantChunksDependencies,
  RetrieveRelevantChunksInput,
  RetrieveRelevantChunksType,
} from './types.js';

export const DEFAULT_RETRIEVAL_LIMIT = 5;

const createDefaultDependencies = (): RetrieveRelevantChunksDependencies => ({
  createEmbedding: (input) => createStoredEmbedding({ input }),
  searchRagChunks: searchStoredRagChunks(),
});

export const normalizeRetrievalLimit = (limit: number | undefined): number => {
  if (limit === undefined || !Number.isFinite(limit)) {
    return DEFAULT_RETRIEVAL_LIMIT;
  }

  return Math.max(1, Math.min(20, Math.trunc(limit)));
};

export const createRetrieveRelevantChunks = (
  dependencies: Partial<RetrieveRelevantChunksDependencies> = {},
): RetrieveRelevantChunksType => {
  const services = {
    ...createDefaultDependencies(),
    ...dependencies,
  };

  return async ({ message, limit }: RetrieveRelevantChunksInput) => {
    const embedding = await services.createEmbedding(message);

    return services.searchRagChunks({
      embedding,
      limit: normalizeRetrievalLimit(limit),
    });
  };
};

export const retrieveRelevantChunks = createRetrieveRelevantChunks();
