# Project Memory

This repository is `local-agent-starter`, a Yarn workspace fullstack starter
being adapted into a local RAG/agent project.

## Current Shape

- Node requirement: `>=24.0.0`.
- Package manager: Yarn 4.17.0.
- Workspaces live under `packages/*` and `workspaces/*`.
- Shared React components live in `packages/components`.
- Components in `packages/components` should ideally stay dumb,
  presentational, and controlled by props. Prefer moving state, effects, API
  calls, and other orchestration into the entry point or workspace-level hooks.
- Demo/sample data for components belongs in Storybook stories, not component
  implementation files.
- UI hooks live in `workspaces/ui/hooks`; keep one exported hook function per
  file and place its focused tests next to it.
- API, streaming chat, MCP, and UI workspaces live in `workspaces/api`,
  `workspaces/chat`, `workspaces/mcp`, and `workspaces/ui`.
- Chat and MCP package logic lives in `packages/chat` and `packages/mcp`;
  their workspaces stay thin and handle runtime/transport concerns.
- Project documentation lives in `docs/`; screenshots are kept in
  `docs/screenshots`.
- The main UI is `AgentShell`, a local agent/RAG shell with Chat and Upload
  tabs.
- The API exposes `POST /upload` for raw file uploads. It writes files into
  `DOCS_DIR`, defaulting to `docker/docs` locally and `/app/docs` in Docker.
- The API also serves built UI static assets from `/static` in Docker. The UI
  workspace builds browser assets into `dist/api/static`, and the API container
  sets `UI=/static` so SSR HTML points at the in-container assets.

## Commands

- `yarn dev` runs local app dev servers in parallel.
- `yarn dev:api` runs `workspaces/api/bin/start.sh`.
- `yarn dev:chat` runs `workspaces/chat/bin/start.sh`.
- `yarn dev:mcp` runs `workspaces/mcp/bin/start.sh`.
- `yarn dev:ui` runs `workspaces/ui/bin/start.sh`.
- `yarn start` runs `docker compose up -d --build`.
- `yarn stop` runs `docker compose down`.
- `yarn check` runs lint, build, and tests.
- Jest uses `@vyriy/jest-config`, which enforces 100% global coverage for
  statements, branches, functions, and lines. New code must either be fully
  covered or intentionally excluded through the shared config patterns.
- Prefer focused validation while working:
  - `yarn lint:ts` for TypeScript
  - `yarn lint:eslint` after TS/TSX/YAML/YML changes
  - `yarn lint:prettier` after docs/config formatting changes
  - `yarn test:jest <changed tests or package>` for narrow test runs
- Keep coverage enabled unless temporarily diagnosing a test issue. If coverage
  is disabled for investigation, rerun the relevant Jest command with coverage
  before finishing.

## Docker And Database

- Docker Compose defines `api`, `chat`, `mcp`, `postgres`, and `pgadmin`.
- The `api` service is built as image `local-agent-api` from context
  `./dist/api` using `../../workspaces/api/Dockerfile`.
- The `chat` service is built as image `local-agent-chat` from context
  `./dist/chat` using `../../workspaces/chat/Dockerfile`.
- The `mcp` service is built as image `local-agent-mcp` from context
  `./dist/mcp` using `../../workspaces/mcp/Dockerfile`.
- The `api` service is exposed on `${API_PORT:-3000}:3000` and waits for
  healthy Postgres.
- The `chat` service is exposed on `${CHAT_PORT:-3002}:3000` and serves
  streaming chat responses from `/chat`.
- The `mcp` service is exposed on `${MCP_PORT:-3003}:3000` and serves MCP
  Streamable HTTP from `/mcp`.
- The `api` service mounts `./docker/docs` to `/app/docs` for uploaded demo
  documents.
- In Docker Compose, the `api` service sets `DOCS_DIR=/app/docs`, so uploads
  land in the mounted `./docker/docs` directory on the host.
- In Docker Compose, the `api` service sets `UI=/static`, and the API routes
  `/static/*` to the built static asset directory copied into the API image.
- Postgres image: `pgvector/pgvector:pg18`.
- Postgres data uses the `postgres-data` Docker named volume mounted at
  `/var/lib/postgresql`. This mount path matters for PostgreSQL 18 images.
- Postgres init scripts are kept in `./docker/postgres`.
- Current init script: `docker/postgres/init.sql`.
- Init scripts run only when the named volume is empty.
- pgAdmin server definitions are kept in `./docker/pgadmin/servers.json`.
- Inside the Docker network pgAdmin connects to Postgres with host `postgres`,
  port `5432`, database `rag`, and user `rag`.
- `workspaces/api/Dockerfile`, `workspaces/chat/Dockerfile`, and
  `workspaces/mcp/Dockerfile` are runtime-only. Run the matching build command
  first so each Docker context under `dist/*` contains the generated `index.js`
  and `package.json`.
- The runtime Dockerfiles run `npm install --omit=dev --ignore-scripts` inside
  the image because built workspaces may still require runtime packages.

## Environment

- `.env` is local and ignored by git.
- `.env.example` documents required local values.
- Current important variables: `POSTGRES_DB`, `POSTGRES_USER`,
  `POSTGRES_PASSWORD`, `PG_PORT`, `PGADMIN_PORT`, `API_PORT`, `CHAT_PORT`,
  `MCP_PORT`, `DOCS_DIR`, embedding provider settings, and chat LLM provider
  settings.

## Package And Workspace Conventions

- Package and workspace source should use `.js` relative import/export
  specifiers where required by the current ESM style, for example
  `export * from './feature.js';`.
- If a package creates a new public export, update the source export file,
  usually `index.ts`, and add or update `index.test.ts`.
- When changing public behavior, sync the root `README.md` and the nearest
  package/workspace `README.md` or `doc.mdx` alongside examples, tests, and
  Storybook docs/stories so documentation stays aligned with the actual API.
- Add packages or workspaces only when they reduce real complexity, clarify
  boundaries, or improve reuse. Do not add them just for elegance.
- Keep source `package.json` files minimal and aligned with existing workspace
  patterns; add dependencies only when code imports them at runtime.

## Implementation Guidance

- Prefer small, calm, reviewable changes that are easy to explain and validate.
- Read the nearest package/workspace files before editing and follow local
  patterns.
- Keep files small and focused. One exported runtime method or hook per file is
  ideal when it stays readable.
- Prefer one matching test file per production code file, for example
  `feature.ts` and `feature.test.ts`.
- Split multi-responsibility files into cohesive modules instead of growing
  broad utility files.
- Extract constants when they are shared, clarify intent, or reduce behavior
  noise. Keep tightly coupled constants near the code that owns them.
- Avoid abstraction for its own sake; split code only when it makes behavior
  easier to understand, test, or reuse.
- Prefer the simpler, easier-to-evolve option when two approaches are equally
  capable.

## Collaboration Notes

- Keep this file updated with important project decisions so future sessions do
  not lose context.
- Prefer small, focused changes that match existing workspace patterns.
- Do not commit runtime data, generated database files, or local secrets.
- After changing any YAML/YML file, run `yarn lint:eslint`; the ESLint config
  validates YAML files and catches issues such as empty mapping values.
- The trace panel must be described as visible application-level trace, not
  hidden model thoughts.
- Storybook navigation should be ordered as docs first, then workspaces, then
  packages, then component stories.
