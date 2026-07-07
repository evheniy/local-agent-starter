import { Pool } from 'pg';

import type { CreateClientConfigType, QueryType } from './types.js';

let client: Pool | undefined;

/** Creates Postgres connection options from the current environment. */
export const createClientConfig: CreateClientConfigType = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
    };
  }

  return {
    database: process.env.POSTGRES_DB ?? 'rag',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    password: process.env.POSTGRES_PASSWORD ?? 'rag',
    port: Number(process.env.POSTGRES_PORT ?? process.env.PG_PORT ?? 5432),
    user: process.env.POSTGRES_USER ?? 'rag',
  };
};

/** Creates a Postgres pool. */
export const createClient = () => new Pool(createClientConfig());

/** Returns the shared Postgres pool. */
export const getClient = () => {
  client ??= createClient();

  return client;
};

/** Runs a SQL query against the shared Postgres pool. */
export const query: QueryType = (text, values = []) => getClient().query(text, values);

/** Closes the shared Postgres pool. */
export const closeClient = async () => {
  await client?.end();
  client = undefined;
};
