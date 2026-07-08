import { query } from './client.js';

import type {
  QueryType,
  ClaimNextRagIndexJobType,
  CompleteRagIndexJobType,
  CreateRagChunkType,
  CreateRagDocumentType,
  CreateUploadedFileType,
  DeleteRagDocumentByFileIdType,
  EnqueueRagIndexJobType,
  EnsureRagIndexJobsSchemaType,
  EnsureRagIndexSchemaType,
  EnsureUploadedFilesSchemaType,
  FailRagIndexJobType,
  GetUploadedFileByIdType,
  GetUploadedFileByPathType,
  ListUploadedFilesType,
  MarkUploadedFileIndexedType,
  RagDocument,
  RagDocumentRow,
  RagIndexJob,
  RagIndexJobRow,
  RetrievedRagChunk,
  RetrievedRagChunkRow,
  SearchRagChunksType,
  UpdateUploadedFileStatusType,
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
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
});

const mapRagDocument = (row: RagDocumentRow): RagDocument => ({
  id: String(row.id),
  fileId: String(row.file_id),
  title: row.title ?? row.source,
  source: row.source,
  path: row.path,
  metadata: row.metadata ?? {},
});

const mapRagIndexJob = (row: RagIndexJobRow): RagIndexJob => ({
  id: String(row.id),
  fileId: String(row.file_id),
  status: row.status,
  attempts: row.attempts === null ? 0 : Number(row.attempts),
  error: row.error ?? undefined,
});

const mapRetrievedRagChunk = (row: RetrievedRagChunkRow): RetrievedRagChunk => ({
  documentTitle: row.document_title ?? row.source,
  path: row.path,
  chunkIndex: Number(row.chunk_index),
  score: Number(row.score),
  content: row.content,
});

/** Ensures uploaded file metadata schema exists. */
export const ensureUploadedFilesSchema =
  (queryDatabase: QueryType = query): EnsureUploadedFilesSchemaType =>
  async () => {
    await queryDatabase('CREATE EXTENSION IF NOT EXISTS vector');
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

/** Ensures RAG document and chunk schema exists. */
export const ensureRagIndexSchema =
  (queryDatabase: QueryType = query): EnsureRagIndexSchemaType =>
  async () => {
    await ensureUploadedFilesSchema(queryDatabase)();
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS rag_documents (
        id BIGSERIAL PRIMARY KEY,
        file_id BIGINT REFERENCES rag_files(id) ON DELETE SET NULL,
        source TEXT NOT NULL,
        path TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL DEFAULT '',
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS rag_chunks (
        id BIGSERIAL PRIMARY KEY,
        document_id BIGINT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
        chunk_index INT NOT NULL,
        content TEXT NOT NULL,
        embedding VECTOR(1024) NOT NULL,
        metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryDatabase(
      "ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb",
    );
    await queryDatabase("ALTER TABLE rag_chunks ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb");
    await queryDatabase('CREATE INDEX IF NOT EXISTS rag_chunks_document_id_idx ON rag_chunks (document_id)');
    await queryDatabase(
      'CREATE UNIQUE INDEX IF NOT EXISTS rag_chunks_document_chunk_idx ON rag_chunks (document_id, chunk_index)',
    );
  };

/** Ensures RAG indexing job queue schema exists. */
export const ensureRagIndexJobsSchema =
  (queryDatabase: QueryType = query): EnsureRagIndexJobsSchemaType =>
  async () => {
    await ensureUploadedFilesSchema(queryDatabase)();
    await queryDatabase(`
      CREATE TABLE IF NOT EXISTS rag_index_jobs (
        id BIGSERIAL PRIMARY KEY,
        file_id BIGINT NOT NULL REFERENCES rag_files(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
        attempts INT NOT NULL DEFAULT 0,
        error TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        started_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        failed_at TIMESTAMPTZ
      )
    `);
    await queryDatabase(
      "CREATE UNIQUE INDEX IF NOT EXISTS rag_index_jobs_active_file_idx ON rag_index_jobs (file_id) WHERE status IN ('queued', 'running')",
    );
    await queryDatabase(
      "CREATE INDEX IF NOT EXISTS rag_index_jobs_queue_idx ON rag_index_jobs (created_at ASC, id ASC) WHERE status = 'queued'",
    );
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

/** Finds uploaded file metadata by id. */
export const getUploadedFileById =
  (queryDatabase: QueryType = query): GetUploadedFileByIdType =>
  async (id) => {
    await ensureUploadedFilesSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        SELECT id, name, path, size, type, status, chunks_count
        FROM rag_files
        WHERE id = $1
        LIMIT 1
      `,
      [id],
    );
    const row = result.rows[0] as UploadedFileRow | undefined;

    return row ? mapUploadedFile(row) : undefined;
  };

/** Lists uploaded file metadata ordered newest first. */
export const listUploadedFiles =
  (queryDatabase: QueryType = query): ListUploadedFilesType =>
  async (input = {}) => {
    await ensureUploadedFilesSchema(queryDatabase)();

    const result = input.status
      ? await queryDatabase(
          `
            SELECT id, name, path, size, type, status, chunks_count, created_at
            FROM rag_files
            WHERE status = $1
            ORDER BY created_at DESC, id DESC
          `,
          [input.status],
        )
      : await queryDatabase(`
        SELECT id, name, path, size, type, status, chunks_count, created_at
        FROM rag_files
        ORDER BY created_at DESC, id DESC
      `);

    return (result.rows as UploadedFileRow[]).map(mapUploadedFile);
  };

/** Updates an uploaded file status. */
export const updateUploadedFileStatus =
  (queryDatabase: QueryType = query): UpdateUploadedFileStatusType =>
  async ({ id, status }) => {
    await ensureUploadedFilesSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        UPDATE rag_files
        SET status = $2
        WHERE id = $1
        RETURNING id, name, path, size, type, status, chunks_count
      `,
      [
        id,
        status,
      ],
    );
    const row = result.rows[0] as UploadedFileRow | undefined;

    return row ? mapUploadedFile(row) : undefined;
  };

/** Marks an uploaded file as indexed and stores its chunk count. */
export const markUploadedFileIndexed =
  (queryDatabase: QueryType = query): MarkUploadedFileIndexedType =>
  async ({ id, chunksCount }) => {
    await ensureUploadedFilesSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        UPDATE rag_files
        SET status = 'indexed', chunks_count = $2
        WHERE id = $1
        RETURNING id, name, path, size, type, status, chunks_count
      `,
      [
        id,
        chunksCount,
      ],
    );
    const row = result.rows[0] as UploadedFileRow | undefined;

    return row ? mapUploadedFile(row) : undefined;
  };

/** Deletes an existing RAG document for an uploaded file. */
export const deleteRagDocumentByFileId =
  (queryDatabase: QueryType = query): DeleteRagDocumentByFileIdType =>
  async (fileId) => {
    await ensureRagIndexSchema(queryDatabase)();
    await queryDatabase('DELETE FROM rag_documents WHERE file_id = $1', [fileId]);
  };

/** Creates a RAG document for an uploaded file. */
export const createRagDocument =
  (queryDatabase: QueryType = query): CreateRagDocumentType =>
  async ({ fileId, title, source, path, content = '', metadata = {} }) => {
    await ensureRagIndexSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        INSERT INTO rag_documents (file_id, title, source, path, content, metadata)
        VALUES ($1, $2, $3, $4, $5, $6::jsonb)
        RETURNING id, file_id, title, source, path, metadata
      `,
      [
        fileId,
        title,
        source,
        path,
        content,
        JSON.stringify(metadata),
      ],
    );

    return mapRagDocument(result.rows[0] as RagDocumentRow);
  };

/** Creates a RAG chunk with its pgvector embedding. */
export const createRagChunk =
  (queryDatabase: QueryType = query): CreateRagChunkType =>
  async ({ documentId, chunkIndex, content, embedding, metadata = {} }) => {
    await ensureRagIndexSchema(queryDatabase)();
    await queryDatabase(
      `
        INSERT INTO rag_chunks (document_id, chunk_index, content, embedding, metadata)
        VALUES ($1, $2, $3, $4::vector, $5::jsonb)
      `,
      [
        documentId,
        chunkIndex,
        content,
        JSON.stringify(embedding),
        JSON.stringify(metadata),
      ],
    );
  };

/** Searches indexed chunks using pgvector cosine distance. */
export const searchRagChunks =
  (queryDatabase: QueryType = query): SearchRagChunksType =>
  async ({ embedding, limit }) => {
    await ensureRagIndexSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        SELECT
          d.title AS document_title,
          d.source,
          d.path,
          c.chunk_index,
          c.content,
          1 - (c.embedding <=> $1::vector) AS score
        FROM rag_chunks c
        INNER JOIN rag_documents d ON d.id = c.document_id
        INNER JOIN rag_files f ON f.id = d.file_id
        WHERE f.status = 'indexed'
        ORDER BY c.embedding <=> $1::vector ASC
        LIMIT $2
      `,
      [
        JSON.stringify(embedding),
        limit,
      ],
    );

    return (result.rows as RetrievedRagChunkRow[]).map(mapRetrievedRagChunk);
  };

/** Enqueues a RAG indexing job, returning an existing active job when present. */
export const enqueueRagIndexJob =
  (queryDatabase: QueryType = query): EnqueueRagIndexJobType =>
  async ({ fileId }) => {
    await ensureRagIndexJobsSchema(queryDatabase)();

    const inserted = await queryDatabase(
      `
        INSERT INTO rag_index_jobs (file_id, status)
        VALUES ($1, 'queued')
        ON CONFLICT (file_id) WHERE status IN ('queued', 'running')
        DO NOTHING
        RETURNING id, file_id, status, attempts, error
      `,
      [fileId],
    );
    const insertedRow = inserted.rows[0] as RagIndexJobRow | undefined;

    if (insertedRow) {
      return mapRagIndexJob(insertedRow);
    }

    const existing = await queryDatabase(
      `
        SELECT id, file_id, status, attempts, error
        FROM rag_index_jobs
        WHERE file_id = $1
          AND status IN ('queued', 'running')
        ORDER BY created_at ASC, id ASC
        LIMIT 1
      `,
      [fileId],
    );

    return mapRagIndexJob(existing.rows[0] as RagIndexJobRow);
  };

/** Claims the next queued indexing job. */
export const claimNextRagIndexJob =
  (queryDatabase: QueryType = query): ClaimNextRagIndexJobType =>
  async () => {
    await ensureRagIndexJobsSchema(queryDatabase)();

    const result = await queryDatabase(`
      UPDATE rag_index_jobs
      SET status = 'running',
          started_at = NOW(),
          attempts = attempts + 1,
          error = NULL
      WHERE id = (
        SELECT id
        FROM rag_index_jobs
        WHERE status = 'queued'
        ORDER BY created_at ASC, id ASC
        FOR UPDATE SKIP LOCKED
        LIMIT 1
      )
      RETURNING id, file_id, status, attempts, error
    `);
    const row = result.rows[0] as RagIndexJobRow | undefined;

    return row ? mapRagIndexJob(row) : undefined;
  };

/** Marks an indexing job completed. */
export const completeRagIndexJob =
  (queryDatabase: QueryType = query): CompleteRagIndexJobType =>
  async ({ id }) => {
    await ensureRagIndexJobsSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        UPDATE rag_index_jobs
        SET status = 'completed',
            completed_at = NOW(),
            error = NULL
        WHERE id = $1
        RETURNING id, file_id, status, attempts, error
      `,
      [id],
    );
    const row = result.rows[0] as RagIndexJobRow | undefined;

    return row ? mapRagIndexJob(row) : undefined;
  };

/** Marks an indexing job failed. */
export const failRagIndexJob =
  (queryDatabase: QueryType = query): FailRagIndexJobType =>
  async ({ id, error }) => {
    await ensureRagIndexJobsSchema(queryDatabase)();

    const result = await queryDatabase(
      `
        UPDATE rag_index_jobs
        SET status = 'failed',
            failed_at = NOW(),
            error = $2
        WHERE id = $1
        RETURNING id, file_id, status, attempts, error
      `,
      [
        id,
        error,
      ],
    );
    const row = result.rows[0] as RagIndexJobRow | undefined;

    return row ? mapRagIndexJob(row) : undefined;
  };
