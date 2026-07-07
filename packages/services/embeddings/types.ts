export type CreateEmbeddingInput = {
  input: string;
  model?: string;
  baseUrl?: string;
  dimensions?: number;
  fetch?: typeof fetch;
};

export type CreateEmbeddingType = (input: string) => Promise<number[]>;

export type EmbeddingResponse = {
  data?: Array<{
    embedding?: unknown;
  }>;
};
