# API

Server-rendered workspace for the local agent starter application.

## Behavior

The API starts an `@vyriy/server` handler and serves:

- `GET /` returns an HTML document with a server-rendered `AgentShell`.
- `GET /files` returns persisted uploaded file metadata from Postgres.
- `POST /upload?filename=name.ext` writes a raw uploaded file into `DOCS_DIR`
  persists metadata in `rag_files`, and enqueues a background indexing job.
- `POST /files/:id/index` is a debug/retry endpoint that indexes an uploaded
  file directly.
- `GET /static/*` serves the built UI assets when they are present in the API
  build output.
- Unknown routes return the router `404` response.

The HTML includes:

- `http://localhost:3001/main.css` by default in local development
- `http://localhost:3001/index.js` by default in local development
- `/static/main.css` and `/static/index.js` in Docker
- the local agent shell mounted by the UI bundle

The UI origin is read through `getUi()` from `@p/env`.
Upload storage is controlled by `DOCS_DIR`; it defaults to `docker/docs`
locally and `/app/docs` in Docker Compose. Uploaded file metadata is stored in
the `rag_files` Postgres table. Uploads enqueue `rag_index_jobs` rows with
status `queued`; the indexer worker claims those jobs, creates or replaces the
`rag_documents` row for the uploaded file, and stores ordered `rag_chunks` rows
with embeddings. Only text-like files are supported for now; binary formats
such as PDF and DOCX should be parsed in a later step.

Example flow:

```bash
curl -X POST "http://localhost:3000/upload?filename=notes.md" \
  --data-binary @notes.md
```

Run the background indexer locally with:

```bash
yarn dev:indexer
```

Embedding settings:

```env
EMBEDDING_PROVIDER=lmstudio
EMBEDDING_BASE_URL=http://host.docker.internal:1234
EMBEDDING_MODEL=text-embedding-qwen3-embedding-0.6b
EMBEDDING_DIMENSIONS=1024
INDEXER_POLL_MS=5000
```

## Local Development

From the repository root:

```bash
yarn dev:api
```

The script sources `workspaces/env.sh` and starts `workspaces/api/index.tsx` with `tsx watch`.

Default local values:

- `API_PORT=3000`
- `API=http://localhost:3000`
- `UI=http://localhost:3001`
- `DOCS_DIR=$PWD/docker/docs`

Run the UI workspace alongside the API when loading the full page:

```bash
yarn dev
```

## Build

```bash
yarn build:api
```

The build emits the server bundle to `dist/api/index.js`, copies the workspace
`package.json` into `dist/api`, and the UI build emits browser assets into
`dist/api/static`.

## Docker

The API Dockerfile is multi-stage. It installs workspace dependencies, builds
the UI assets and API bundle inside Docker, then copies the generated
`dist/api` output into the runtime image:

```bash
docker build -f workspaces/api/Dockerfile .
```

It exposes port `3000`, which matches the default `PORT` value. Docker Compose
sets `UI=/static`, mounts `./docker/docs` to `/app/docs`, and can build the API
image without Node or Yarn installed on the host.

## Validation

```bash
yarn test:jest workspaces/api
```

The tests verify server registration, the rendered root response, response
headers, linked UI assets, uploads, indexing job enqueue, static assets, and
the `404` path.
