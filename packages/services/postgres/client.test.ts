import { describe, expect, it, jest } from '@jest/globals';

const endMock = jest.fn(() => Promise.resolve());
const queryMock = jest.fn(() =>
  Promise.resolve({
    rows: [],
  }),
);
const poolMock = jest.fn(() => ({
  end: endMock,
  query: queryMock,
}));

jest.mock('pg', () => ({
  Pool: poolMock,
}));

const restoreEnv = (name: string, value: string | undefined) => {
  if (typeof value === 'string') {
    process.env[name] = value;

    return;
  }

  delete process.env[name];
};

describe('postgres client', () => {
  it('creates a client config from postgres environment variables', async () => {
    const { createClientConfig } = await import('./client.js');
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousPostgresHost = process.env.POSTGRES_HOST;
    const previousPostgresPort = process.env.POSTGRES_PORT;
    const previousPostgresDatabase = process.env.POSTGRES_DB;
    const previousPostgresUser = process.env.POSTGRES_USER;
    const previousPostgresPassword = process.env.POSTGRES_PASSWORD;
    const previousPgPort = process.env.PG_PORT;

    try {
      delete process.env.DATABASE_URL;
      process.env.POSTGRES_HOST = 'db.local';
      process.env.POSTGRES_PORT = '15432';
      process.env.POSTGRES_DB = 'rag_test';
      process.env.POSTGRES_USER = 'rag_user';
      process.env.POSTGRES_PASSWORD = 'secret';

      expect(createClientConfig()).toEqual({
        database: 'rag_test',
        host: 'db.local',
        password: 'secret',
        port: 15432,
        user: 'rag_user',
      });
    } finally {
      restoreEnv('DATABASE_URL', previousDatabaseUrl);
      restoreEnv('POSTGRES_HOST', previousPostgresHost);
      restoreEnv('POSTGRES_PORT', previousPostgresPort);
      restoreEnv('POSTGRES_DB', previousPostgresDatabase);
      restoreEnv('POSTGRES_USER', previousPostgresUser);
      restoreEnv('POSTGRES_PASSWORD', previousPostgresPassword);
      restoreEnv('PG_PORT', previousPgPort);
    }
  });

  it('uses local defaults when database environment variables are not set', async () => {
    const { createClientConfig } = await import('./client.js');
    const previousDatabaseUrl = process.env.DATABASE_URL;
    const previousPostgresHost = process.env.POSTGRES_HOST;
    const previousPostgresPort = process.env.POSTGRES_PORT;
    const previousPostgresDatabase = process.env.POSTGRES_DB;
    const previousPostgresUser = process.env.POSTGRES_USER;
    const previousPostgresPassword = process.env.POSTGRES_PASSWORD;
    const previousPgPort = process.env.PG_PORT;

    try {
      delete process.env.DATABASE_URL;
      delete process.env.POSTGRES_HOST;
      delete process.env.POSTGRES_PORT;
      delete process.env.POSTGRES_DB;
      delete process.env.POSTGRES_USER;
      delete process.env.POSTGRES_PASSWORD;
      delete process.env.PG_PORT;

      expect(createClientConfig()).toEqual({
        database: 'rag',
        host: 'localhost',
        password: 'rag',
        port: 5432,
        user: 'rag',
      });
    } finally {
      restoreEnv('DATABASE_URL', previousDatabaseUrl);
      restoreEnv('POSTGRES_HOST', previousPostgresHost);
      restoreEnv('POSTGRES_PORT', previousPostgresPort);
      restoreEnv('POSTGRES_DB', previousPostgresDatabase);
      restoreEnv('POSTGRES_USER', previousPostgresUser);
      restoreEnv('POSTGRES_PASSWORD', previousPostgresPassword);
      restoreEnv('PG_PORT', previousPgPort);
    }
  });

  it('uses PG_PORT when POSTGRES_PORT is not set', async () => {
    const { createClientConfig } = await import('./client.js');
    const previousPostgresPort = process.env.POSTGRES_PORT;
    const previousPgPort = process.env.PG_PORT;

    try {
      delete process.env.POSTGRES_PORT;
      process.env.PG_PORT = '25432';

      expect(createClientConfig()).toMatchObject({
        port: 25432,
      });
    } finally {
      restoreEnv('POSTGRES_PORT', previousPostgresPort);
      restoreEnv('PG_PORT', previousPgPort);
    }
  });

  it('prefers DATABASE_URL when it is set', async () => {
    const { createClientConfig } = await import('./client.js');
    const previousDatabaseUrl = process.env.DATABASE_URL;

    try {
      process.env.DATABASE_URL = 'postgres://rag:rag@localhost:5432/rag';

      expect(createClientConfig()).toEqual({
        connectionString: 'postgres://rag:rag@localhost:5432/rag',
      });
    } finally {
      restoreEnv('DATABASE_URL', previousDatabaseUrl);
    }
  });

  it('creates, queries, and closes the shared client', async () => {
    const { closeClient, createClient, getClient, query } = await import('./client.js');

    expect(createClient()).toEqual({
      end: endMock,
      query: queryMock,
    });
    expect(getClient()).toBe(getClient());
    await expect(query('SELECT 1', [])).resolves.toEqual({
      rows: [],
    });
    expect(queryMock.mock.calls[0]).toEqual(['SELECT 1', []]);

    await closeClient();

    expect(endMock).toHaveBeenCalledTimes(1);
  });
});
