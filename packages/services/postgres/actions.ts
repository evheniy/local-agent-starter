import { query } from './client.js';

import type {
  QueryType,
  CreateUploadedFileType,
  EnsureUploadedFilesSchemaType,
  GetUploadedFileByPathType,
  ListUploadedFilesType,
  UploadedFile,
  UploadedFileRow,
} from './types.js';

const mapUploadedFile = (row: UploadedFileRow): UploadedFile => ({
  id: String(row.id),
  name: row.name,
  path: row.path,
  size: row.size === null ? undefined : Number(row.size),
  type: row.type ?? undefined,
  status: row.status,
  chunksCount: row.chunks_count ?? undefined,
});

/** Ensures uploaded file metadata schema exists. */
export const ensureUploadedFilesSchema =
  (queryDatabase: QueryType = query): EnsureUploadedFilesSchemaType =>
  async () => {
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS rag_files (
        id BIGSERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        size BIGINT,
        type TEXT,
        status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'indexing', 'indexed', 'error')),
        chunks_count INT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryDatabase('CREATE INDEX IF NOT EXISTS rag_files_created_at_idx ON rag_files (created_at DESC, id DESC)');
    await queryDatabase('CREATE UNIQUE INDEX IF NOT EXISTS rag_files_path_idx ON rag_files (path)');
  };

/** Persists uploaded file metadata. */
export const createUploadedFile =
  (queryDatabase: QueryType = query): CreateUploadedFileType =>
  async ({ name, path, size, type }) => {
    await ensureUploadedFilesSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        INSERT INTO rag_files (name, path, size, type, status)
        VALUES ($1, $2, $3, $4, 'uploaded')
        RETURNING id, name, path, size, type, status, chunks_count
      `,
      [
        name,
        path,
        size,
        type ?? null,
      ],
    );

    return mapUploadedFile(result.rows[0] as UploadedFileRow);
  };

/** Finds uploaded file metadata by stored path. */
export const getUploadedFileByPath =
  (queryDatabase: QueryType = query): GetUploadedFileByPathType =>
  async (path) => {
    await ensureUploadedFilesSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        SELECT id, name, path, size, type, status, chunks_count
        FROM rag_files
        WHERE path = $1
        LIMIT 1
      `,
      [path],
    );
    const row = result.rows[0] as UploadedFileRow | undefined;

    return row ? mapUploadedFile(row) : undefined;
  };

/** Lists uploaded file metadata ordered newest first. */
export const listUploadedFiles =
  (queryDatabase: QueryType = query): ListUploadedFilesType =>
  async () => {
    await ensureUploadedFilesSchema(queryDatabase)();

    const result = await queryDatabase(`
      SELECT id, name, path, size, type, status, chunks_count
      FROM rag_files
      ORDER BY created_at DESC, id DESC
    `);

    return (result.rows as UploadedFileRow[]).map(mapUploadedFile);
  };
