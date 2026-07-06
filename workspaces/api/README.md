# API

Server-rendered workspace for the local agent starter application.

## Behavior

The API starts an `@vyriy/server` handler and serves the root route:

- `GET /` returns an HTML document with a server-rendered `AgentShell`.
- `POST /upload?filename=name.ext` writes a raw uploaded file into `DOCS_DIR`.
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
locally and `/app/docs` in Docker Compose.

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

The API Dockerfile is runtime-only. Build the API first:

```bash
yarn build:api
```

Then build the image from the generated API output:

```bash
docker build -f workspaces/api/Dockerfile dist/api
```

The Dockerfile expects `index.js`, `package.json`, and static assets to already
exist in the build context. It exposes port `3000`, which matches the default
`PORT` value. Docker Compose sets `UI=/static` and mounts `./docker/docs` to
`/app/docs`.

## Validation

```bash
yarn test:jest workspaces/api
```

The tests verify server registration, the rendered root response, response
headers, linked UI assets, uploads, static assets, and the `404` path.
