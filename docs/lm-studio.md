# LM Studio setup

Local Agent Starter uses LM Studio as an OpenAI-compatible provider for two
independent workloads:

- a **chat model** generates the final RAG answer;
- an **embedding model** converts document chunks and questions into vectors.

Both must be downloaded and available through the LM Studio API server. They
may have different identifiers and memory requirements.

## 1. Install models and start the server

Install and open LM Studio, download one chat/instruct model and one embedding
model, then open **Developer** and start the server on the default port `1234`.
The equivalent CLI command is:

```bash
lms server start --port 1234
```

This project uses the OpenAI-compatible endpoints:

```text
GET  /v1/models
POST /v1/chat/completions
POST /v1/embeddings
```

Inspect the identifiers exposed by the running server:

```bash
curl http://localhost:1234/v1/models
```

The `LLM_MODEL` and `EMBEDDING_MODEL` values must match the returned API `id`
values exactly. Display names in the LM Studio UI can differ. Depending on the
LM Studio Just-In-Time loading setting, `/v1/models` may show all downloaded
models or only loaded models.

## 2. Configure Docker access

Create the local environment file:

```bash
cp .env.example .env
```

The checked-in defaults are:

```env
EMBEDDING_PROVIDER=lmstudio
EMBEDDING_BASE_URL=http://host.docker.internal:1234
EMBEDDING_MODEL=text-embedding-qwen3-embedding-0.6b
EMBEDDING_DIMENSIONS=1024

LLM_PROVIDER=lmstudio
LLM_BASE_URL=http://host.docker.internal:1234/v1
LLM_MODEL=qwen2.5-coder-7b-instruct
```

The embedding client accepts a base with or without `/v1`; the documented form
matches `.env.example`. The chat client expects the `/v1` API base.

Those `.env` URLs are for Docker. When running all workspace processes directly
on the host, override them for that command:

```bash
EMBEDDING_BASE_URL=http://localhost:1234 \
LLM_BASE_URL=http://localhost:1234/v1 \
yarn dev
```

Containers cannot reach a host process through their own `localhost`, so
Compose uses `host.docker.internal`. On Docker Desktop this hostname normally
works automatically. If LM Studio only accepts connections from `127.0.0.1`,
enable **Serve on Local Network** or start it with:

```bash
lms server start --port 1234 --bind 0.0.0.0
```

This exposes the API beyond localhost. Use a trusted private network and enable
LM Studio authentication/firewall protection when appropriate.

## 3. Smoke-test both models

Use the exact identifiers from `/v1/models` in these host-side checks.

```bash
curl http://localhost:1234/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{
    "model": "qwen2.5-coder-7b-instruct",
    "messages": [{"role":"user","content":"Reply with exactly: chat ready"}],
    "temperature": 0
  }'
```

```bash
curl http://localhost:1234/v1/embeddings \
  -H 'content-type: application/json' \
  -d '{
    "model": "text-embedding-qwen3-embedding-0.6b",
    "input": "Local Agent Starter embedding test"
  }'
```

The second response must contain a numeric `data[0].embedding` array with 1024
elements for the default schema. The model output length,
`EMBEDDING_DIMENSIONS`, and `rag_chunks.embedding VECTOR(1024)` must agree.

You can also test host access from a running container:

```bash
docker compose exec api node -e \
  "fetch('http://host.docker.internal:1234/v1/models').then(r => r.text()).then(console.log)"
```

## 4. Start and verify the application

```bash
yarn start
```

Then complete the full path:

1. Confirm `http://localhost:3000` opens.
2. Open **Upload** and upload `docs/concepts.md`.
3. Observe the file progress from uploaded/indexing to **Ready** (`indexed`).
4. Open **Chat** and ask:

   ```text
   According to concepts.md, what is an agent in this project? Answer briefly.
   ```

5. Confirm the answer streams, source previews reference `concepts.md`, and
   the application trace completes.

Health checks and a longer walkthrough are in [the demo](demo.md).

## Common errors

- **`ECONNREFUSED`, `fetch failed`, or timeout:** confirm the server is on port
  1234, enable network serving when required, and use
  `host.docker.internal` inside Docker.
- **Model not found:** copy the exact `id` from `/v1/models` into `.env`, then
  restart the affected containers with `docker compose up -d --build`.
- **Embedding length/dimension error:** confirm the embedding array length and
  all configured/schema dimensions match.
- **Indexing remains queued or becomes error:** inspect
  `docker compose logs -f indexer` and smoke-test embeddings.
- **Sources appear but answer generation fails:** inspect
  `docker compose logs -f chat` and smoke-test chat completions.
- **Insufficient RAM/VRAM:** choose smaller quantized models, reduce model
  context settings, or use LM Studio's Just-In-Time loading.

See [troubleshooting](troubleshooting.md) for database, streaming, WSL, ports,
jobs, and reset guidance.

## Changing embedding dimensions

Changing the environment variable alone cannot alter an existing pgvector
column. For disposable local demo data, recreate the database:

```bash
docker compose down -v
docker compose up -d --build
```

This permanently deletes the local Compose Postgres volume and all indexed
metadata/chunks. Before starting, also update `VECTOR(...)` in
`docker/postgres/init.sql` and the matching runtime schema definition in
`packages/services/postgres/actions.ts`, or implement a migration. A normal
restart is safer when no schema change is intended.

## Optional headless operation

LM Studio's headless daemon can run without the desktop UI:

```bash
lms daemon up
lms server start --port 1234 --bind 0.0.0.0
curl http://localhost:1234/v1/models
```

Load/download models as required by the machine's LM Studio configuration. For
a remote host, replace `host.docker.internal` with its private network address
and secure the exposed server.
