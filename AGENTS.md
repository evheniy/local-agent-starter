# Project Memory

This repository is `local-agent-starter`, a Yarn workspace fullstack starter
being adapted into a local RAG/agent project.

## Current Shape

- Node requirement: `>=24.0.0`.
- Package manager: Yarn 4.17.0.
- Workspaces live under `packages/*` and `workspaces/*`.
- Shared React components live in `packages/components`.
- API, static asset server, and UI workspaces live in `workspaces/api`,
  `workspaces/static`, and `workspaces/ui`.
- Project documentation lives in `docs/`; screenshots are kept in
  `docs/screenshots`.

## Commands

- `yarn dev` runs local app dev servers in parallel.
- `yarn dev:api` runs `workspaces/api/bin/start.sh`.
- `yarn dev:static` runs `workspaces/static/bin/start.sh`.
- `yarn dev:ui` runs `workspaces/ui/bin/start.sh`.
- `yarn start` runs `docker compose up -d --build`.
- `yarn stop` runs `docker compose down`.
- `yarn check` runs lint, build, and tests.

## Docker And Database

- Docker Compose defines `api`, `postgres`, and `pgadmin`.
- The `api` service is built as image `local-agent-api` from context
  `./dist/api` using `../../workspaces/api/Dockerfile`.
- The `api` service is exposed on `${API_PORT:-3000}:3000` and waits for
  healthy Postgres.
- Postgres image: `pgvector/pgvector:pg18`.
- Postgres data uses the `postgres-data` Docker named volume mounted at
  `/var/lib/postgresql`. This mount path matters for PostgreSQL 18 images.
- Postgres init scripts are kept in `./docker/postgres`.
- Current init script: `docker/postgres/init.sql`.
- Init scripts run only when the named volume is empty.
- pgAdmin server definitions are kept in `./docker/pgadmin/servers.json`.
- Inside the Docker network pgAdmin connects to Postgres with host `postgres`,
  port `5432`, database `rag`, and user `rag`.
- `workspaces/api/Dockerfile` is runtime-only. Run `yarn build:api` first, then
  build with `docker build -f workspaces/api/Dockerfile dist/api` so the Docker
  context contains the generated `index.js` and `package.json`.
- The API Dockerfile runs `npm install --omit=dev --ignore-scripts` inside the
  image because the built `index.js` still requires runtime packages such as
  `react-dom/client`.

## Environment

- `.env` is local and ignored by git.
- `.env.example` documents required local values.
- Current important variables: `POSTGRES_DB`, `POSTGRES_USER`,
  `POSTGRES_PASSWORD`, `PG_PORT`, `PGADMIN_PORT`, embedding provider settings,
  and chat LLM provider settings.

## Collaboration Notes

- Keep this file updated with important project decisions so future sessions do
  not lose context.
- Prefer small, focused changes that match existing workspace patterns.
- Do not commit runtime data, generated database files, or local secrets.
- After changing any YAML/YML file, run `yarn lint:eslint`; the ESLint config
  validates YAML files and catches issues such as empty mapping values.
