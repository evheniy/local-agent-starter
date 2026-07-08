# Local Agent Starter

Yarn workspace fullstack starter for a local RAG/agent application. The project
contains a server-rendered API, a browser UI bundle, a streaming chat service, a
background indexer worker, a small MCP service, shared package logic, Storybook
documentation, and Docker Compose infrastructure for local development.

## Setup

```bash
yarn install
```

The project uses Yarn `4.17.0`, Node `>=24.0.0`, and workspaces under
`packages/*` and `workspaces/*`.

## Development

Start all local workspace dev servers together:

```bash
yarn dev
```

Start individual workspaces:

```bash
yarn dev:api
yarn dev:chat
yarn dev:indexer
yarn dev:mcp
yarn dev:postgres
yarn dev:ui
```

Default local ports are defined in `workspaces/env.sh`:

- API: `http://localhost:3000`
- UI dev assets: `http://localhost:3001`
- Chat: `http://localhost:3002`
- MCP: `http://localhost:3003`
- Indexer: background worker with no public port
- Postgres with pgvector: `localhost:5432`

Override `API_PORT`, `UI_PORT`, `CHAT_PORT`, `MCP_PORT`, `API`, `UI`, `CHAT`,
or `MCP` before running a script when local services need different addresses.

`yarn dev:postgres` runs `docker compose up postgres` in the foreground. When
it is started by `yarn dev`, pressing Ctrl+C stops the workspace processes and
the local Postgres container.

## Docker

Start the local Docker stack in the background:

```bash
yarn start
```

Stop it:

```bash
yarn stop
```

`yarn start` runs `docker compose up -d --build`. `yarn stop` runs
`docker compose down`.

The compose file starts:

- API on `http://localhost:${API_PORT:-3000}`.
- Chat on `http://localhost:${CHAT_PORT:-3002}`.
- Indexer worker with no public port.
- MCP on `http://localhost:${MCP_PORT:-3003}`.
- Postgres with pgvector on `localhost:${PG_PORT:-5432}`.
- pgAdmin on `http://localhost:${PGADMIN_PORT:-5433}`.

The API container serves the server-rendered page and the built UI static files
from the same origin. In Docker, `UI=/static`, so the HTML returned by `GET /`
points at `/static/main.css` and `/static/index.js`.

Uploaded demo documents are mounted into the API container from `docker/docs` at
`/app/docs`. Postgres data is stored in the `postgres-data` Docker named volume
mounted at `/var/lib/postgresql`, so it persists across `docker compose down`
without writing database files into the repository. Init scripts live in
`docker/postgres` and run only when the named volume is empty. pgAdmin server
definitions live in `docker/pgadmin`.

## Workspaces

- `workspaces/api` serves `GET /`, `GET /files`, non-streaming RAG
  `POST /chat`, `POST /upload`, the debug `POST /files/:id/index` endpoint,
  and `/static/*`.
- `workspaces/chat` serves streaming chat responses from `POST /chat`.
- `workspaces/indexer` polls and processes queued RAG indexing jobs.
- `workspaces/mcp` serves MCP Streamable HTTP from `POST /mcp`.
- `workspaces/ui` builds and serves the browser entry point.

Workspaces are intentionally thin. Shared logic belongs in packages, while
workspace code owns runtime startup, transport, bundling, and deployment shape.

## Packages

- `packages/api` contains API HTML and upload helpers.
- `packages/chat` contains chat request/response logic.
- `packages/components` contains shared dumb React components and styles.
- `packages/env` contains required environment readers.
- `packages/mcp` contains MCP server/tool registration logic.
- `packages/services` contains infrastructure service clients and actions,
  including Postgres access under `@p/services/postgres`.

Components in `packages/components` should stay presentational and controlled by
props. Workspace entry points and hooks own state, effects, and API wiring.
Demo data belongs in Storybook stories.

## Local RAG UI

The browser UI is a small local document assistant. It can upload text-like
documents, show automatic indexing status, ask questions over indexed files,
stream assistant answers, and show compact source previews.

Run the UI locally with:

```bash
yarn dev:ui
```

For the full RAG flow, also run the API, Postgres, indexer, chat service, a
local embedding model, and a local chat LLM. The combined development command is:

```bash
yarn dev
```

Manual UI flow:

1. Open `http://localhost:3001`.
2. Upload `notes.md`.
3. Wait for the file status to become Ready.
4. Ask `What does this document say?`.
5. Confirm the answer streams and sources appear under the assistant message.

## API Surface

The API workspace exposes:

- `GET /` - server-rendered `AgentShell` HTML.
- `GET /files` - persisted uploaded file metadata from Postgres.
- `POST /chat` - non-streaming RAG chat over indexed uploaded files.
- `POST /upload?filename=name.ext` - raw file upload into `DOCS_DIR`, metadata
  persistence, and automatic background indexing job enqueue.
- `POST /files/:id/index` - debug/retry endpoint that indexes an uploaded file
  directly.
- `GET /static/*` - built UI assets in Docker and production builds.

`DOCS_DIR` defaults to `docker/docs` locally and `/app/docs` in Docker.
Uploaded file metadata is stored first in the `rag_files` Postgres table.
Uploads enqueue `rag_index_jobs` rows with status `queued`; the indexer worker
claims those jobs, writes one `rag_documents` row and ordered `rag_chunks` rows
with pgvector embeddings, then marks the job `completed` or `failed`.
Re-indexing the same file replaces old chunks. For now, indexing supports
text-like files such as Markdown, JSON, TypeScript, JavaScript, CSS, HTML,
YAML, and CSV; PDF and DOCX parsing can be added later.

Example upload flow:

```bash
curl -X POST "http://localhost:3000/upload?filename=notes.md" \
  --data-binary @notes.md
```

Run the background indexer locally with:

```bash
yarn dev:indexer
```

Ask over indexed files with:

```bash
curl -X POST "http://localhost:3000/chat" \
  -H "content-type: application/json" \
  -d '{"message":"What does notes.md say?","limit":5}'
```

Embedding configuration defaults to an OpenAI-compatible LM Studio endpoint:

```env
EMBEDDING_PROVIDER=lmstudio
EMBEDDING_BASE_URL=http://host.docker.internal:1234
EMBEDDING_MODEL=text-embedding-qwen3-embedding-0.6b
EMBEDDING_DIMENSIONS=1024
INDEXER_POLL_MS=5000
```

The API `POST /chat` route also uses `EMBEDDING_BASE_URL`,
`EMBEDDING_MODEL`, `LLM_BASE_URL`, and `LLM_MODEL` to retrieve indexed chunks
and call a non-streaming OpenAI-compatible chat completions endpoint.

The chat workspace exposes:

- `POST /chat` - `text/event-stream` response with thinking, delta, and final
  events.
- `POST /chat/stream` - RAG `text/event-stream` response with `sources`,
  `answer_delta`, `done`, and `error` events.
- `GET /healthcheck` - service metadata.

Manual streaming RAG test:

```bash
curl -N \
  -H "content-type: application/json" \
  -H "accept: text/event-stream" \
  -X POST "http://localhost:3002/chat/stream" \
  -d '{"message":"What does this document say?","limit":5}'
```

The MCP workspace exposes:

- `POST /mcp` - MCP Streamable HTTP endpoint.
- `GET /healthcheck` - service metadata.

The MCP server is Vyriy-based and exposes these read-only tools:

- `ping` - checks that the MCP server is alive.
- `list_documents` - lists uploaded local documents with indexing status and
  chunk counts.
- `search_documents` - searches indexed local documents and returns matching
  chunks with scores and source metadata.
- `ask_documents` - asks a non-streaming RAG question over indexed local
  documents and returns compact sources.

## Build

Build all production outputs:

```bash
yarn build
```

Focused builds are also available:

```bash
yarn build:api
yarn build:chat
yarn build:indexer
yarn build:mcp
yarn build:ui
yarn build:storybook
```

The API bundle is emitted to `dist/api`. The UI build emits browser assets into
`dist/api/static` so the API image can serve SSR HTML and static assets together.
Chat, indexer, and MCP bundles are emitted to `dist/chat`, `dist/indexer`, and
`dist/mcp`.

Docker Compose app images use multi-stage Dockerfiles and build their bundles
inside Docker, so running the Docker stack does not require Node or Yarn to be
installed on the host:

```bash
docker compose up -d --build
```

## Storybook

Run Storybook docs and component stories:

```bash
yarn storybook
```

Storybook loads project docs first, then workspace docs, package docs, and
component stories. Shared component styles come from
`packages/components/styles.scss`.

## Validation

```bash
yarn lint
yarn test
yarn build
```

Use `yarn check` to run linting, build, and tests in one command.

Jest uses `@vyriy/jest-config`, which enforces 100% global coverage for
statements, branches, functions, and lines. Keep new public behavior covered and
sync the nearby README, `doc.mdx`, Storybook stories, and examples when behavior
changes.

## Project Guidance

These articles describe the development approach behind this preset and provide
practical guidance for evolving a project on top of it:

- [Calm Development Environment: Node.js, Corepack, Yarn and Static Preview](https://vyriy.dev/blog/calm-development-setup/) -
  how to keep the local development environment predictable and easy to
  reproduce.
- [Calm App Structure for the Vyriy Ecosystem](https://vyriy.dev/blog/vyriy-calm-app-structure/) -
  a practical project structure for Vyriy applications: shared configs, small
  packages, thin workspaces, Storybook docs, tests, and deployable entry points.
- [One Handler, Many Runtimes](https://vyriy.dev/examples/one-handler-many-runtimes/) -
  how @vyriy/handler, @vyriy/router, and @vyriy/server compose a calm
  Lambda-compatible API that can run locally, in Docker, Fargate-style HTTP
  runtimes, and AWS Lambda.
- [Small Node.js Streaming Server for AI Agents](https://vyriy.dev/blog/small-nodejs-streaming-server-for-ai-agents/) -
  how to build a focused Node.js streaming server for agent responses.
- [From Static Sites to MCP: The Vyriy Server Family](https://vyriy.dev/blog/from-static-sites-to-mcp-the-vyriy-server-family/) -
  how the Vyriy server tools fit static sites, APIs, streaming services, and MCP
  transports.
- [Calm Component Structure](https://vyriy.dev/blog/calm-component-structure/) -
  how to organize component code, tests, stories, and public exports.
- [Storybook as Project Documentation](https://vyriy.dev/blog/storybook-as-project-documentation/) -
  how to use Storybook as living project documentation and a component
  playground.

Project-specific notes live in `docs/`:

- [Architecture](docs/architecture.md)
- [Concepts](docs/concepts.md)
- [Demo](docs/demo.md)
- [LM Studio](docs/lm-studio.md)
- [MCP](docs/mcp.md)
- [pgvector](docs/pgvector.md)
