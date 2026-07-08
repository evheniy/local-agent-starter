import { afterEach, describe, expect, it } from '@jest/globals';

import {
  getApi,
  getDocsDir,
  getEmbeddingBaseUrl,
  getEmbeddingDimensions,
  getEmbeddingModel,
  getIndexerPollMs,
  getLlmBaseUrl,
  getLlmModel,
  getPostgresDatabaseUrl,
  getPostgresDb,
  getPostgresHost,
  getPostgresPassword,
  getPostgresPort,
  getPostgresUser,
  getUi,
  isTest,
} from './env.js';

describe('env getters', () => {
  afterEach(() => {
    delete process.env.API;
    delete process.env.DATABASE_URL;
    delete process.env.DOCS_DIR;
    delete process.env.EMBEDDING_BASE_URL;
    delete process.env.EMBEDDING_DIMENSIONS;
    delete process.env.EMBEDDING_MODEL;
    delete process.env.INDEXER_POLL_MS;
    delete process.env.LLM_BASE_URL;
    delete process.env.LLM_MODEL;
    delete process.env.NODE_ENV;
    delete process.env.PG_PORT;
    delete process.env.POSTGRES_DB;
    delete process.env.POSTGRES_HOST;
    delete process.env.POSTGRES_PASSWORD;
    delete process.env.POSTGRES_PORT;
    delete process.env.POSTGRES_USER;
    delete process.env.UI;
  });

  it('reads required environment values', () => {
    process.env.API = 'http://localhost:3000';
    process.env.UI = 'http://localhost:3001';

    expect(getApi()).toBe('http://localhost:3000');
    expect(getUi()).toBe('http://localhost:3001');
  });

  it('throws when a required environment value is missing', () => {
    expect(() => getUi()).toThrow('Environment variable UI is not defined!');
  });

  it('uses the local docs directory by default', () => {
    expect(getDocsDir()).toMatch(/docker\/docs$/u);
  });

  it('uses the Docker docs directory in production by default', () => {
    process.env.NODE_ENV = 'production';

    expect(getDocsDir()).toBe('/app/docs');
  });

  it('uses a configured docs directory', () => {
    process.env.DOCS_DIR = 'custom/docs';

    expect(getDocsDir()).toMatch(/custom\/docs$/u);
  });

  it('uses the local docs directory when development inherits the Docker docs path', () => {
    process.env.NODE_ENV = 'development';
    process.env.DOCS_DIR = '/app/docs';

    expect(getDocsDir()).toMatch(/docker\/docs$/u);
  });

  it('reads embedding configuration', () => {
    process.env.EMBEDDING_MODEL = 'embedding-model';
    process.env.EMBEDDING_BASE_URL = 'http://embedding.local/v1';
    process.env.EMBEDDING_DIMENSIONS = '3';

    expect(getEmbeddingModel()).toBe('embedding-model');
    expect(getEmbeddingBaseUrl()).toBe('http://embedding.local/v1');
    expect(getEmbeddingDimensions()).toBe(3);
  });

  it('uses default embedding configuration', () => {
    expect(getEmbeddingModel()).toBe('text-embedding-qwen3-embedding-0.6b');
    expect(getEmbeddingBaseUrl()).toBe('http://host.docker.internal:1234');
    expect(getEmbeddingDimensions()).toBe(1024);
  });

  it('reads LLM configuration', () => {
    process.env.LLM_MODEL = 'chat-model';
    process.env.LLM_BASE_URL = 'http://llm.local/v1';

    expect(getLlmModel()).toBe('chat-model');
    expect(getLlmBaseUrl()).toBe('http://llm.local/v1');
  });

  it('uses default LLM configuration', () => {
    expect(getLlmModel()).toBe('local-model');
    expect(getLlmBaseUrl()).toBe('http://host.docker.internal:1234');
  });

  it('reads indexer configuration', () => {
    process.env.INDEXER_POLL_MS = '25';

    expect(getIndexerPollMs()).toBe(25);
  });

  it('uses default indexer configuration', () => {
    expect(getIndexerPollMs()).toBe(5000);
  });

  it('reads Postgres configuration', () => {
    process.env.DATABASE_URL = 'postgres://rag:rag@db.local:5432/rag';
    process.env.POSTGRES_DB = 'rag_test';
    process.env.POSTGRES_HOST = 'db.local';
    process.env.POSTGRES_PASSWORD = 'secret';
    process.env.POSTGRES_PORT = '15432';
    process.env.POSTGRES_USER = 'rag_user';

    expect(getPostgresDatabaseUrl()).toBe('postgres://rag:rag@db.local:5432/rag');
    expect(getPostgresDb()).toBe('rag_test');
    expect(getPostgresHost()).toBe('db.local');
    expect(getPostgresPassword()).toBe('secret');
    expect(getPostgresPort()).toBe(15432);
    expect(getPostgresUser()).toBe('rag_user');
  });

  it('uses default Postgres configuration', () => {
    expect(getPostgresDatabaseUrl()).toBeUndefined();
    expect(getPostgresDb()).toBe('rag');
    expect(getPostgresHost()).toBe('localhost');
    expect(getPostgresPassword()).toBe('rag');
    expect(getPostgresPort()).toBe(5432);
    expect(getPostgresUser()).toBe('rag');
  });

  it('uses PG_PORT as the fallback Postgres port', () => {
    process.env.PG_PORT = '25432';

    expect(getPostgresPort()).toBe(25432);
  });

  it('detects test mode', () => {
    process.env.NODE_ENV = 'test';

    expect(isTest()).toBe(true);
  });
});
