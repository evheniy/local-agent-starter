/** Creates the OpenAI-compatible embeddings endpoint URL. */
export const createEmbeddingsUrl = (baseUrl: string) => {
  const normalized = baseUrl.replace(/\/+$/u, '');

  if (normalized.endsWith('/v1')) {
    return `${normalized}/embeddings`;
  }

  return `${normalized}/v1/embeddings`;
};
