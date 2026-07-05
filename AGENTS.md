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

## Commands

- `yarn dev` runs local app dev servers in parallel.
- `yarn dev:api` runs `workspaces/api/bin/start.sh`.
- `yarn dev:static` runs `workspaces/static/bin/start.sh`.
- `yarn dev:ui` runs `workspaces/ui/bin/start.sh`.
- `yarn start` runs `docker compose up -d`.
- `yarn stop` runs `docker compose down`.
- `yarn check` runs lint, build, and tests.

## Docker And Database

- Docker Compose defines `postgres` and `pgadmin`.
- Postgres image: `pgvector/pgvector:pg18`.
- Postgres data is mounted at `./docker/data/postgres` and ignored by git.
- Postgres init scripts are kept in `./docker/postgres`.
- Current init script: `docker/postgres/init.sql`.
- `PGDATA` is `/var/lib/postgresql/data/pgdata`.
- Init scripts run only for a fresh/empty Postgres data directory.

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
