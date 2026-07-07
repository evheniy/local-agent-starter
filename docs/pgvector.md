# pgvector

Postgres uses the `pgvector` extension for embedding storage and similarity
search.

The current init script is:

```text
docker/postgres/init.sql
```

It creates:

- `rag_documents`
- `rag_chunks`
- `rag_chunks_document_id_idx`

The `rag_chunks.embedding` column currently uses `VECTOR(1024)`. Keep this
dimension aligned with the embedding model.

Init scripts run only when the Postgres data directory is empty.
