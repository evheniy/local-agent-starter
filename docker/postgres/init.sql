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
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rag_chunks (
  id BIGSERIAL PRIMARY KEY,
  document_id BIGINT NOT NULL REFERENCES rag_documents(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(4096) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rag_chunks_document_id_idx ON rag_chunks (document_id);
CREATE INDEX IF NOT EXISTS rag_files_created_at_idx ON rag_files (created_at DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS rag_files_path_idx ON rag_files (path);
