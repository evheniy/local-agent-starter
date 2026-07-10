# Troubleshooting

Start with service state and recent logs:

```bash
docker compose ps
docker compose logs --tail=200 api chat indexer mcp postgres
```

Follow one service while reproducing a problem:

```bash
docker compose logs -f api
docker compose logs -f indexer
docker compose logs -f chat
docker compose logs -f mcp
docker compose logs -f postgres
```

## LM Studio is not reachable from Docker

Confirm `curl http://localhost:1234/v1/models` works on the host. Docker
configuration must use `http://host.docker.internal:1234`, not container-local
`localhost`. If necessary, enable LM Studio **Serve on Local Network** and
check the host firewall. Test from the API container:

```bash
docker compose exec api node -e \
  "fetch('http://host.docker.internal:1234/v1/models').then(r => r.text()).then(console.log)"
```

On Linux engines where the special hostname is unavailable, add an appropriate
host-gateway mapping or use a reachable host address. Docker Desktop usually
provides the name automatically.

The reverse applies to `yarn dev`: its Node processes run on the host and should
use `http://localhost:1234` (plus `/v1` for `LLM_BASE_URL`) instead of the
Docker-only hostname.

## Model identifier not found

Run `curl http://localhost:1234/v1/models`, copy the exact returned model `id`
to `LLM_MODEL` or `EMBEDDING_MODEL`, and restart the affected containers. Make
sure the model is downloaded/loaded or Just-In-Time model loading is enabled.

## Embedding dimension mismatch

The model output length, `EMBEDDING_DIMENSIONS=1024`, and PostgreSQL
`rag_chunks.embedding VECTOR(1024)` must match. Changing only `.env` is not a
schema migration. For disposable local data, update both schema definitions and
use the destructive reset described below.

## Document remains queued or indexing

The browser shows file states (`uploaded`, `indexing`, `indexed`, `error`),
while `rag_index_jobs` uses `queued`, `running`, `completed`, and `failed`.

- Check `docker compose ps indexer` and `docker compose logs -f indexer`.
- Confirm `INDEXER_POLL_MS` is a valid positive interval.
- Test the embedding endpoint from the host and a container.
- Inspect active jobs with the read-only SQL below.

A job left `running` after an abrupt worker termination is not automatically
requeued by the current starter. Preserve the data and inspect it before using
the direct debug route or resetting the local database.

## Failed indexing job

The worker records the error in `rag_index_jobs.error` and sets the file to
`error`. Typical causes are an unsupported extension, an unreadable file, an
unreachable embedding server, an unknown model, or a dimension mismatch.

```bash
docker compose exec postgres psql -U rag -d rag -c \
  "SELECT id, file_id, status, attempts, error, created_at FROM rag_index_jobs ORDER BY id DESC LIMIT 20;"
```

Fix the cause first. `POST /files/:id/index` is the direct debug/retry endpoint;
normal uploads rely on the background queue.

## No relevant chunks are returned

Confirm at least one file is `indexed` and has a nonzero `chunks_count`. Check
that the same embedding model/dimension was used for indexing and querying.
Try a question containing terminology from the document and inspect stored
chunks using the SQL in [pgvector](pgvector.md). Retrieval always returns up to
the requested nearest chunks; weak sources usually indicate unsuitable content,
a vague query, or incompatible embeddings rather than an empty vector index.

## Streaming closes or sends an error event

Check `docker compose logs -f chat`, then test the non-streaming API and LM
Studio chat endpoint separately. A transport/status error before SSE begins is
returned as an HTTP error; a provider/retrieval error after the stream begins
can arrive as an SSE `error` event. Browser proxies and extensions can also
interrupt long-lived connections.

```bash
curl -N http://localhost:3002/chat/stream \
  -H 'content-type: application/json' \
  -H 'accept: text/event-stream' \
  -d '{"message":"What is an agent?","limit":5}'
```

## Stale schema after editing init SQL

Files under `docker/postgres` run only when the named Postgres volume is empty.
Editing `init.sql` does not update an existing database. Use a real migration
when data matters, or the clean reset below for disposable demo data.

## Port conflicts

Use `docker compose ps` and your OS port tools to find the listener. Change the
host-side values in `.env` (`API_PORT`, `CHAT_PORT`, `MCP_PORT`, `PG_PORT`, or
`PGADMIN_PORT`) without changing container ports. The Docker/full app normally
uses port 3000; the UI-only dev server uses 3001.

## WSL and Docker Desktop

Run Compose from the same WSL distribution that owns the checkout, make sure
Docker Desktop WSL integration is enabled, and test both the Windows host and
the container path to LM Studio. Windows Firewall may need to allow LM Studio
on the active private network. Avoid replacing `host.docker.internal` with
`localhost` inside containers.

## Restart versus clean reset

A non-destructive restart preserves uploaded files and the Postgres volume:

```bash
docker compose down
docker compose up -d --build
```

A clean database reset is destructive and should be used only for disposable
local data or an intentional schema/dimension change:

```bash
docker compose down -v
docker compose up -d --build
```

The reset removes the Postgres named volume and indexed database data. Raw
uploads under `docker/docs` are a separate bind mount; remove them manually only
when you intentionally want a completely clean demo.
