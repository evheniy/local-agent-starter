import type { PoolConfig, QueryResultRow } from 'pg';

/** Status for a file tracked by Postgres. */
export type UploadedFileStatus = 'uploaded' | 'indexing' | 'indexed' | 'error';

/** File metadata persisted by the RAG API. */
export type UploadedFile = {
  id: string;
  name: string;
  path: string;
  size?: number;
  type?: string;
  status: UploadedFileStatus;
  chunksCount?: number;
};

/** Raw uploaded file row returned by Postgres. */
export type UploadedFileRow = {
  id: string;
  name: string;
  path: string;
  size: string | number | null;
  type: string | null;
  status: UploadedFileStatus;
  chunks_count: number | null;
};

/** Input used when persisting uploaded file metadata. */
export type CreateUploadedFileInput = {
  name: string;
  path: string;
  size: number;
  type?: string;
};

/** Persists uploaded file metadata. */
export type CreateUploadedFileType = (input: CreateUploadedFileInput) => Promise<UploadedFile>;

/** Ensures uploaded file metadata schema exists. */
export type EnsureUploadedFilesSchemaType = () => Promise<void>;

/** Finds uploaded file metadata by stored path. */
export type GetUploadedFileByPathType = (path: string) => Promise<UploadedFile | undefined>;

/** Lists uploaded file metadata. */
export type ListUploadedFilesType = () => Promise<UploadedFile[]>;

/** Creates Postgres connection options. */
export type CreateClientConfigType = () => PoolConfig;

/** Runs a SQL query and returns rows. */
export type QueryType = (text: string, values?: unknown[]) => Promise<{ rows: QueryResultRow[] }>;
