# Indexer

Background worker for queued RAG file indexing jobs.

The API upload handler writes uploaded file metadata to `rag_files`, enqueues a
`rag_index_jobs` row with status `queued`, and returns immediately. This worker
polls queued jobs, claims one safely in Postgres, runs the shared
`indexUploadedFile` service, and marks the job `completed` or `failed`.

## Local Development

From the repository root:

```bash
yarn dev:indexer
```

Default local values come from `workspaces/env.sh`:

- `INDEXER_POLL_MS=5000`
- `DOCS_DIR=$PWD/docker/docs`
- Postgres connection settings from `POSTGRES_*`
- embedding settings from `EMBEDDING_*`

## Build

```bash
yarn build:indexer
```

The build emits the worker bundle to `dist/indexer/index.js` and copies the
workspace `package.json` into `dist/indexer`.
