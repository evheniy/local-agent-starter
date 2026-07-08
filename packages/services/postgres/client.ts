import { Pool } from 'pg';

import {
  getPostgresDatabaseUrl,
  getPostgresDb,
  getPostgresHost,
  getPostgresPassword,
  getPostgresPort,
  getPostgresUser,
} from '@p/env';

import type { CreateClientConfigType, QueryType } from './types.js';

let client: Pool | undefined;

/** Creates Postgres connection options from the current environment. */
export const createClientConfig: CreateClientConfigType = () => {
  const connectionString = getPostgresDatabaseUrl();

  if (connectionString) {
    return {
      connectionString,
    };
  }

  return {
    database: getPostgresDb(),
    host: getPostgresHost(),
    password: getPostgresPassword(),
    port: getPostgresPort(),
    user: getPostgresUser(),
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
