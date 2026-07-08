import type { PoolConfig, QueryResultRow } from 'pg';

/** Status for a file tracked by Postgres. */
export type UploadedFileStatus = 'uploaded' | 'indexing' | 'indexed' | 'error';

/** Status for a Postgres-backed indexing job. */
export type RagIndexJobStatus = 'queued' | 'running' | 'completed' | 'failed';

/** File metadata persisted by the RAG API. */
export type UploadedFile = {
  id: string;
  name: string;
  path: string;
  size?: number;
  type?: string;
  status: UploadedFileStatus;
  chunksCount?: number;
  createdAt?: string;
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
  created_at?: Date | string | null;
};

/** RAG document persisted for an indexed uploaded file. */
export type RagDocument = {
  id: string;
  fileId: string;
  title: string;
  source: string;
  path: string;
  metadata: Record<string, unknown>;
};

/** Raw RAG document row returned by Postgres. */
export type RagDocumentRow = {
  id: string | number;
  file_id: string | number;
  title: string | null;
  source: string;
  path: string;
  metadata: Record<string, unknown> | null;
};

/** RAG indexing job persisted in Postgres. */
export type RagIndexJob = {
  id: string;
  fileId: string;
  status: RagIndexJobStatus;
  attempts: number;
  error?: string;
};

/** Raw RAG indexing job row returned by Postgres. */
export type RagIndexJobRow = {
  id: string | number;
  file_id: string | number;
  status: RagIndexJobStatus;
  attempts: string | number | null;
  error: string | null;
};

/** Retrieved RAG chunk matched by vector similarity. */
export type RetrievedRagChunk = {
  documentTitle: string;
  path: string;
  chunkIndex: number;
  score: number;
  content: string;
};

/** Raw retrieved RAG chunk row returned by Postgres. */
export type RetrievedRagChunkRow = {
  document_title: string | null;
  source: string;
  path: string;
  chunk_index: string | number;
  score: string | number;
  content: string;
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

/** Ensures document and chunk schema exists. */
export type EnsureRagIndexSchemaType = () => Promise<void>;

/** Ensures indexing job queue schema exists. */
export type EnsureRagIndexJobsSchemaType = () => Promise<void>;

/** Finds uploaded file metadata by id. */
export type GetUploadedFileByIdType = (id: string) => Promise<UploadedFile | undefined>;

/** Finds uploaded file metadata by stored path. */
export type GetUploadedFileByPathType = (path: string) => Promise<UploadedFile | undefined>;

/** Lists uploaded file metadata. */
export type ListUploadedFilesType = (input?: { status?: UploadedFileStatus }) => Promise<UploadedFile[]>;

/** Updates an uploaded file status. */
export type UpdateUploadedFileStatusType = (input: {
  id: string;
  status: UploadedFileStatus;
}) => Promise<UploadedFile | undefined>;

/** Marks an uploaded file as indexed and stores its chunk count. */
export type MarkUploadedFileIndexedType = (input: {
  id: string;
  chunksCount: number;
}) => Promise<UploadedFile | undefined>;

/** Creates a RAG document for an uploaded file. */
export type CreateRagDocumentType = (input: {
  fileId: string;
  title: string;
  source: string;
  path: string;
  content?: string;
  metadata?: Record<string, unknown>;
}) => Promise<RagDocument>;

/** Deletes a RAG document and cascading chunks by uploaded file id. */
export type DeleteRagDocumentByFileIdType = (fileId: string) => Promise<void>;

/** Creates a RAG chunk with an embedding. */
export type CreateRagChunkType = (input: {
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
  metadata?: Record<string, unknown>;
}) => Promise<void>;

/** Searches indexed RAG chunks by vector similarity. */
export type SearchRagChunksType = (input: { embedding: number[]; limit: number }) => Promise<RetrievedRagChunk[]>;

/** Enqueues an indexing job unless the file already has an active job. */
export type EnqueueRagIndexJobType = (input: { fileId: string }) => Promise<RagIndexJob>;

/** Claims the next queued indexing job. */
export type ClaimNextRagIndexJobType = () => Promise<RagIndexJob | undefined>;

/** Marks an indexing job completed. */
export type CompleteRagIndexJobType = (input: { id: string }) => Promise<RagIndexJob | undefined>;

/** Marks an indexing job failed and stores its error. */
export type FailRagIndexJobType = (input: { id: string; error: string }) => Promise<RagIndexJob | undefined>;

/** Creates Postgres connection options. */
export type CreateClientConfigType = () => PoolConfig;

/** Runs a SQL query and returns rows. */
export type QueryType = (text: string, values?: unknown[]) => Promise<{ rows: QueryResultRow[] }>;
