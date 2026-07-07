const getExpectedDimensions = (dimensions?: number) => Number(dimensions ?? process.env.EMBEDDING_DIMENSIONS ?? 1024);

/** Validates an embedding before it is stored in pgvector. */
export const validateEmbedding = (embedding: unknown, dimensions?: number): number[] => {
  if (!Array.isArray(embedding) || embedding.length === 0) {
    throw new Error('Embedding is required.');
  }

  const values = embedding.map(Number);
  const invalidValue = values.find((value) => !Number.isFinite(value));

  if (invalidValue !== undefined) {
    throw new Error('Embedding must contain only finite numbers.');
  }

  const expectedDimensions = getExpectedDimensions(dimensions);

  if (values.length !== expectedDimensions) {
    throw new Error(`Embedding dimension mismatch: expected ${expectedDimensions}, got ${values.length}`);
  }

  return values;
};
