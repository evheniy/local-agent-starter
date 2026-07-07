CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS rag_files (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  path TEXT NOT NULL,
  size BIGINT,
  type TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'indexing', 'indexed', 'error')),
  chunks_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rag_documents (
  id BIGSERIAL PRIMARY KEY,
  file_id BIGINT REFERENCES rag_files(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  path TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rag_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1024) NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

CREATE INDEX IF NOT EXISTS rag_chunks_document_id_idx ON rag_chunks (document_id);
CREATE UNIQUE INDEX IF NOT EXISTS rag_chunks_document_chunk_idx ON rag_chunks (document_id, chunk_index);
CREATE UNIQUE INDEX IF NOT EXISTS rag_index_jobs_active_file_idx ON rag_index_jobs (file_id) WHERE status IN ('queued', 'running');
CREATE INDEX IF NOT EXISTS rag_index_jobs_queue_idx ON rag_index_jobs (created_at ASC, id ASC) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS rag_files_created_at_idx ON rag_files (created_at DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS rag_files_path_idx ON rag_files (path);
