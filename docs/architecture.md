# Architecture

The repository uses Yarn workspaces.

- `workspaces/api` contains the API runtime.
- `workspaces/ui` contains the browser UI.
- `packages/components` contains shared React components.
- `packages/env` contains environment readers.
- `docker-compose.yml` runs local infrastructure and the built API image.
- `docker/postgres` contains Postgres init scripts.
- Postgres data uses the `postgres-data` Docker named volume mounted at
  `/var/lib/postgresql`.

Development servers are started with `yarn dev`. Docker services are started
with `yarn start` and stopped with `yarn stop`.
