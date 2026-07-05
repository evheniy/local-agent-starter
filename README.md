# Fullstack

Calm cloud-ready profile-card application.

This repository contains a small fullstack demo with shared React components,
required environment readers, a server-rendered API page, a static asset origin,
and a client-rendered UI bundle.

## Setup

```bash
yarn install
```

The project uses Yarn workspaces and Node `>=24.0.0`.

## Development

Start the API, static asset server, and UI dev server together:

```bash
yarn dev
```

Start individual workspaces:

```bash
yarn dev:api
yarn dev:static
yarn dev:ui
```

`yarn dev:static` uses the `vs` CLI from `@vyriy/static` to serve project
static files from `workspaces/static/public`.

## Docker

Start local Docker services in the background:

```bash
yarn start
```

Stop local Docker services:

```bash
yarn stop
```

`yarn start` runs `docker compose up -d --build`. `yarn stop` runs
`docker compose down`.

The compose file starts:

- Postgres with pgvector on `localhost:${PG_PORT}`.
- pgAdmin on `http://localhost:${PGADMIN_PORT}` with a preconfigured
  `Local RAG Postgres` server.

Docker init scripts live in `docker/postgres`. pgAdmin server definitions live
in `docker/pgadmin`. Uploaded demo documents are mounted into the API container
from `docker/docs` at `/app/docs`. Postgres data is stored in the
`postgres-data` Docker named volume mounted at `/var/lib/postgresql`, so it
persists across `docker compose down` without writing database files into the
repository. Postgres init scripts run only when the named volume is empty.

## Local URLs

Default ports and origins are defined in `workspaces/env.sh`:

- API: `http://localhost:3000`
- Static/CDN assets: `http://localhost:3001`
- UI dev server: `http://localhost:3002`

Override `API_PORT`, `CDN_PORT`, `UI_PORT`, `API`, `CDN`, or `UI` before
running a script when local services need different addresses.

## Workspaces

- `packages/components` provides the shared profile-card React component set.
- `packages/env` provides required environment readers for `API`, `CDN`, and
  `UI`.
- `workspaces/api` serves the SSR demo page at `GET /`.
- `workspaces/static` serves public static assets such as `avatar.svg` through
  `vs` from `@vyriy/static`.
- `workspaces/ui` builds and serves the browser entry point.

Each package or workspace has its own README with focused usage notes.

## Static Server

`@vyriy/static` provides the `vs` command for serving static files. The project
uses it through `npx` in `workspaces/static/bin/start.sh`:

```bash
npx vs -p 3001 workspaces/static/public
```

It can also be installed globally when the same static server is useful outside
the workspace scripts:

```bash
npm install --global @vyriy/static
vs -p 3001 workspaces/static/public
```

## Storybook

Run Storybook docs and component stories:

```bash
yarn storybook
```

Storybook loads package and workspace `doc.mdx` files and shared component
styles from `packages/components/styles.scss`.

## Build

Build all production outputs:

```bash
yarn build
```

Focused builds are also available:

```bash
yarn build:api
yarn build:static
yarn build:ui
yarn build:storybook
```

The API bundle is emitted to `dist/api`; UI and static assets are emitted to `dist/cdn`.

## Validation

```bash
yarn lint
yarn test
yarn build
```

Use `yarn check` to run linting, build, and tests in one command.

## Project Guidance

These articles describe the development approach behind this preset and provide practical guidance for evolving a project on top of it:

- [Calm Development Environment: Node.js, Corepack, Yarn and Static Preview](https://vyriy.dev/blog/calm-development-setup/) - how to keep the local development environment predictable and easy to reproduce.
- [Calm App Structure for the Vyriy Ecosystem](https://vyriy.dev/blog/vyriy-calm-app-structure/) - a practical project structure for Vyriy applications: shared configs, small packages, thin workspaces, Storybook docs, tests, and deployable entry points.
- [One Handler, Many Runtimes](https://vyriy.dev/examples/one-handler-many-runtimes/) - how @vyriy/handler, @vyriy/router, and @vyriy/server compose a calm Lambda-compatible API that can run locally, in Docker, Fargate-style HTTP runtimes, and AWS Lambda.
- [Calm Component Structure](https://vyriy.dev/blog/calm-component-structure/) - how to organize component code, tests, stories, and public exports.
- [Storybook as Project Documentation](https://vyriy.dev/blog/storybook-as-project-documentation/) - how to use Storybook as living project documentation and a component playground.
