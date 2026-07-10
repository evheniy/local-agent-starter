# Architecture

Local Agent Starter separates deployable runtimes from reusable application
logic. Workspaces own startup, HTTP transport, and bundling; packages own chat,
MCP, UI, database, retrieval, embedding, and document behavior.

## Runtime flow

```text
Browser UI
  ├─ upload → API → rag_files + rag_index_jobs
  ├─ status → API → Postgres
  └─ chat → streaming chat service
                    ├─ embedding provider
                    ├─ pgvector retrieval
                    └─ chat LLM

Indexer worker
  └─ queued job → read file → chunk → embed → rag_documents/rag_chunks

MCP client
  └─ MCP service → shared document/RAG services
```

## Services and ports

| Service       | Default host port | Responsibility                                                                             |
| ------------- | ----------------: | ------------------------------------------------------------------------------------------ |
| API           |            `3000` | SSR page, static UI, uploads, file status, non-streaming chat, direct indexing debug route |
| UI dev server |            `3001` | Browser assets during workspace development only                                           |
| Chat          |            `3002` | Streaming RAG over SSE                                                                     |
| MCP           |            `3003` | Stateless MCP Streamable HTTP endpoint                                                     |
| Indexer       |              none | Polls and processes indexing jobs                                                          |
| Postgres      |            `5432` | File, job, document, chunk, and vector persistence                                         |
| pgAdmin       |            `5433` | Optional database administration UI                                                        |

In the Docker/full-app path, open `http://localhost:3000`. The separate
`http://localhost:3001` URL is only for `yarn dev:ui`.

## Thin workspaces, shared packages

- `workspaces/api`, `chat`, `indexer`, `mcp`, and `ui` are deployable entry
  points.
- `packages/services` contains Postgres actions, file processing, embeddings,
  retrieval, and RAG chat.
- `packages/chat` and `packages/mcp` contain transport-independent chat and MCP
  behavior.
- `packages/components` contains controlled, presentational React components;
  the UI workspace owns state, effects, and API calls.

MCP calls the same document retrieval and RAG services as HTTP chat. This keeps
ranking, prompts, provider configuration, and SQL behavior consistent rather
than creating a second RAG implementation.

## Upload and indexing lifecycle

1. `POST /upload` writes the raw file under `DOCS_DIR`.
2. The API inserts `rag_files` with status `uploaded` and enqueues one active
   `rag_index_jobs` row with status `queued`.
3. The indexer claims the oldest queued job with `FOR UPDATE SKIP LOCKED`, sets
   the job to `running`, and the file to `indexing`.
4. It reads and chunks the file, requests one embedding per chunk, then replaces
   prior document/chunk rows for that file.
5. Success produces file status `indexed` and job status `completed`. Failure
   produces file status `error` and job status `failed` with an error message.

The UI labels an `indexed` file as Ready. The direct
`POST /files/:id/index` route exists for debugging or retrying; normal uploads
do not need it.

## Streaming RAG lifecycle

The browser posts a question to `POST /chat/stream` on the chat service. The
service embeds the question, searches indexed chunks using cosine distance,
sends a `sources` SSE event, builds a grounded prompt, and streams
`answer_delta` events from the chat model. It ends with `done`, or sends
`error` when an error occurs after streaming starts. The visible trace reflects
these application stages, not hidden model thoughts.

## Persisted data and files

Postgres persists uploaded-file metadata, indexing jobs and failures, full
document text, chunks, embeddings, and JSON metadata. Raw uploads live in
`docker/docs` on the host and `/app/docs` in the API/indexer containers. The
named `postgres-data` volume keeps database data across a normal Compose stop.

Indexing currently reads UTF-8 text from `.txt`, `.md`, `.mdx`, `.json`, `.ts`,
`.tsx`, `.js`, `.jsx`, `.css`, `.scss`, `.html`, `.xml`, `.yml`, `.yaml`, and
`.csv` files.

## Deliberate non-goals

This starter intentionally has no authentication, authorization, PDF/DOCX
parser, cloud deployment, production hardening, or general orchestration
framework. It is a local, understandable base for exploring RAG and MCP.
