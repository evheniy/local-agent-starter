# Postgres and pgvector

The `pgvector/pgvector:pg18` container stores application metadata and embedding
vectors. Its initialization source is `docker/postgres/init.sql`.

## Current schema

| Table            | Purpose and relationships                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rag_files`      | One row per upload: name, path, size/type, UI status, chunk count, and creation time. `path` is unique.                                                      |
| `rag_index_jobs` | Queue history. Each row belongs to a file and is deleted with it. A partial unique index permits only one `queued`/`running` job per file.                   |
| `rag_documents`  | Indexed full text and JSON metadata. It normally references its uploaded file; deletion sets `file_id` to null. Re-indexing replaces old rows for that file. |
| `rag_chunks`     | Ordered chunk text, JSON metadata, and embedding. Each row belongs to a document and is cascade-deleted with it.                                             |

Important indexes include unique file paths, file creation ordering, job queue
ordering, active jobs per file, chunks per document, and unique
`(document_id, chunk_index)` positions. There is currently no approximate
HNSW/IVFFlat vector index; this starter performs an exact ordered scan.

## Vector dimension and retrieval

`rag_chunks.embedding` is `VECTOR(1024) NOT NULL`. The embedding provider must
return exactly 1024 numeric values, and `EMBEDDING_DIMENSIONS` must also be 1024. The runtime validates that length before insertion/search.

Retrieval joins chunks to documents and indexed files, then uses pgvector's
cosine-distance operator:

```sql
ORDER BY c.embedding <=> $1::vector ASC
```

The returned similarity score is `1 - cosine_distance`:

```sql
1 - (c.embedding <=> $1::vector) AS score
```

Only chunks whose file has status `indexed` participate.

## Indexing lifecycle

Upload inserts `rag_files` and a `queued` job. The indexer atomically claims the
oldest job with `FOR UPDATE SKIP LOCKED`, marks it `running`, reads/chunks/
embeds the file, replaces the file's existing document/chunks, and finally
marks the file `indexed` and job `completed`. Failures set the file to `error`
and job to `failed`, retaining the error text and attempt count.

## Initialization and schema changes

Postgres runs `docker/postgres/init.sql` only when `/var/lib/postgresql` is
empty. `docker compose down` preserves the `postgres-data` named volume, so
editing the init SQL does not migrate an existing database. Runtime service
actions also contain `CREATE TABLE IF NOT EXISTS` compatibility setup, but that
does not change an existing vector column's dimension.

For important data, create and test an explicit migration. For disposable local
demo data, recreate the volume:

```bash
docker compose down -v
docker compose up -d --build
```

This deletes all database metadata and indexed chunks. Raw uploads in
`docker/docs` are stored separately.

## Read-only inspection

Open an interactive shell:

```bash
docker compose exec postgres psql -U rag -d rag
```

Useful queries:

```sql
SELECT id, name, status, chunks_count, created_at
FROM rag_files
ORDER BY created_at DESC, id DESC;

SELECT id, file_id, status, attempts, error, started_at, completed_at, failed_at
FROM rag_index_jobs
ORDER BY created_at DESC, id DESC;

SELECT d.id, d.file_id, d.title, d.path, count(c.id) AS chunks
FROM rag_documents d
LEFT JOIN rag_chunks c ON c.document_id = d.id
GROUP BY d.id
ORDER BY d.id DESC;

SELECT document_id, chunk_index, left(content, 120) AS preview,
       vector_dims(embedding) AS dimensions
FROM rag_chunks
ORDER BY document_id, chunk_index
LIMIT 25;
```

To inspect table definitions and indexes inside `psql`, use `\d rag_files`,
`\d rag_index_jobs`, `\d rag_documents`, and `\d rag_chunks`.
