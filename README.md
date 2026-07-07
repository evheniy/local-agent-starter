# Local Agent Starter

Yarn workspace fullstack starter for a local RAG/agent application. The project
contains a server-rendered API, a browser UI bundle, a streaming chat service, a
small MCP service, shared package logic, Storybook documentation, and Docker
Compose infrastructure for local development.

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
yarn dev:mcp
yarn dev:postgres
yarn dev:ui
```

Default local ports are defined in `workspaces/env.sh`:

- API: `http://localhost:3000`
- UI dev assets: `http://localhost:3001`
- Chat: `http://localhost:3002`
- MCP: `http://localhost:3003`
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

- `workspaces/api` serves `GET /`, `GET /files`, `POST /upload`, and `/static/*`.
- `workspaces/chat` serves streaming chat responses from `POST /chat`.
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

## API Surface

The API workspace exposes:

- `GET /` - server-rendered `AgentShell` HTML.
- `GET /files` - persisted uploaded file metadata from Postgres.
- `POST /upload?filename=name.ext` - raw file upload into `DOCS_DIR`.
- `GET /static/*` - built UI assets in Docker and production builds.

`DOCS_DIR` defaults to `docker/docs` locally and `/app/docs` in Docker.
Uploaded file metadata is stored in the `rag_files` Postgres table.

The chat workspace exposes:

- `POST /chat` - `text/event-stream` response with thinking, delta, and final
  events.
- `GET /healthcheck` - service metadata.

The MCP workspace exposes:

- `POST /mcp` - MCP Streamable HTTP endpoint.
- `GET /healthcheck` - service metadata.

The current MCP tool surface contains a `ping` tool that returns `pong`.

## Build

Build all production outputs:

```bash
yarn build
```

Focused builds are also available:

```bash
yarn build:api
yarn build:chat
yarn build:mcp
yarn build:ui
yarn build:storybook
```

The API bundle is emitted to `dist/api`. The UI build emits browser assets into
`dist/api/static` so the API image can serve SSR HTML and static assets together.
Chat and MCP bundles are emitted to `dist/chat` and `dist/mcp`.

The runtime Dockerfiles expect the matching build output to exist first. For
example, build the API before building its image:

```bash
yarn build:api
docker build -f workspaces/api/Dockerfile dist/api
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
- [LM Studio](docs/lm-studio.md)
- [MCP](docs/mcp.md)
- [Ollama](docs/ollama.md)
- [pgvector](docs/pgvector.md)
