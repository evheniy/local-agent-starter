import { getEnv } from '@vyriy/env';
import { path } from '@vyriy/path';

const DEFAULT_EMBEDDING_BASE_URL = 'http://host.docker.internal:1234';
const DEFAULT_EMBEDDING_DIMENSIONS = 1024;
const DEFAULT_EMBEDDING_MODEL = 'text-embedding-qwen3-embedding-0.6b';
const DEFAULT_INDEXER_POLL_MS = 5000;
const DEFAULT_LLM_BASE_URL = 'http://host.docker.internal:1234';
const DEFAULT_LLM_MODEL = 'local-model';
const LOCAL_DOCS_DIR = path('docker', 'docs');
const DOCKER_DOCS_DIR = path('/app', 'docs');
const getNodeEnv = () => process.env.NODE_ENV;
const isProduction = () => getNodeEnv() === 'production';
const getDefaultDocsDir = () => (isProduction() ? DOCKER_DOCS_DIR : LOCAL_DOCS_DIR);

/** Reads the API origin used for server endpoints. */
export const getApi = () => getEnv('API');

/** Reads the document upload directory. */
export const getDocsDir = () => {
  const docsDir = process.env.DOCS_DIR;

  if (!isProduction() && docsDir === DOCKER_DOCS_DIR) {
    return LOCAL_DOCS_DIR;
  }

  return docsDir ? path(docsDir) : getDefaultDocsDir();
};

/** Reads the OpenAI-compatible embeddings endpoint base URL. */
export const getEmbeddingBaseUrl = () => process.env.EMBEDDING_BASE_URL ?? DEFAULT_EMBEDDING_BASE_URL;

/** Reads the expected embedding vector dimensions. */
export const getEmbeddingDimensions = () => Number(process.env.EMBEDDING_DIMENSIONS ?? DEFAULT_EMBEDDING_DIMENSIONS);

/** Reads the embedding model name. */
export const getEmbeddingModel = () => process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL;

/** Reads the indexer polling interval in milliseconds. */
export const getIndexerPollMs = () => Number(process.env.INDEXER_POLL_MS ?? DEFAULT_INDEXER_POLL_MS);

/** Reads the OpenAI-compatible chat completions endpoint base URL. */
export const getLlmBaseUrl = () => process.env.LLM_BASE_URL ?? DEFAULT_LLM_BASE_URL;

/** Reads the chat completion model name. */
export const getLlmModel = () => process.env.LLM_MODEL ?? DEFAULT_LLM_MODEL;

/** Reads the Postgres connection string when one is configured. */
export const getPostgresDatabaseUrl = () => process.env.DATABASE_URL;

/** Reads the Postgres database name. */
export const getPostgresDb = () => process.env.POSTGRES_DB ?? 'rag';

/** Reads the Postgres host. */
export const getPostgresHost = () => process.env.POSTGRES_HOST ?? 'localhost';

/** Reads the Postgres password. */
export const getPostgresPassword = () => process.env.POSTGRES_PASSWORD ?? 'rag';

/** Reads the Postgres port. */
export const getPostgresPort = () => Number(process.env.POSTGRES_PORT ?? process.env.PG_PORT ?? 5432);

/** Reads the Postgres user. */
export const getPostgresUser = () => process.env.POSTGRES_USER ?? 'rag';

/** Returns true when code is running under tests. */
export const isTest = () => getNodeEnv() === 'test';

/** Reads the UI origin used for browser assets. */
export const getUi = () => getEnv('UI');
