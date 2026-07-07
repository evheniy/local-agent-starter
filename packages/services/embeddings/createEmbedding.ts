import { createEmbeddingsUrl } from './createEmbeddingsUrl.js';
import { validateEmbedding } from './validateEmbedding.js';

import type { CreateEmbeddingInput, EmbeddingResponse } from './types.js';

const DEFAULT_EMBEDDING_BASE_URL = 'http://host.docker.internal:1234';

/** Creates a single embedding through an OpenAI-compatible embeddings endpoint. */
export const createEmbedding = async ({
  input,
  model = process.env.EMBEDDING_MODEL ?? 'text-embedding-qwen3-embedding-0.6b',
  baseUrl = process.env.EMBEDDING_BASE_URL ?? DEFAULT_EMBEDDING_BASE_URL,
  dimensions,
  fetch: fetchEmbedding = fetch,
}: CreateEmbeddingInput): Promise<number[]> => {
  const response = await fetchEmbedding(createEmbeddingsUrl(baseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input,
    }),
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`Embedding request failed with ${response.status}: ${body}`);
  }

  const body = (await response.json()) as EmbeddingResponse;

  return validateEmbedding(body.data?.[0]?.embedding, dimensions);
};
