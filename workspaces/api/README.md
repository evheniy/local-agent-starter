# API

Server-rendered demo workspace for the profile-card application.

## Behavior

The API starts an `@vyriy/server` handler and serves the root route:

- `GET /` returns an HTML document with a server-rendered `ProfileCard`.
- Unknown routes return the router `404` response.

The HTML includes:

- `http://localhost:3002/main.css` by default
- `http://localhost:3002/index.js` by default
- the demo avatar at `http://localhost:3001/avatar.svg`

The UI origin is read through `getUi()` from `@p/env`.

## Local Development

From the repository root:

```bash
yarn start:api
```

The script sources `workspaces/env.sh` and starts `workspaces/api/index.tsx` with `tsx watch`.

Default local values:

- `API_PORT=3000`
- `API=http://localhost:3000`
- `UI=http://localhost:3002`

Run the static and UI workspaces alongside the API when loading the full page:

```bash
yarn start
```

## Build

```bash
yarn build:api
```

The build emits the server bundle to `dist/api/index.js` and copies the workspace `package.json` into `dist/api`.

## Validation

```bash
yarn test:jest workspaces/api
```

The tests verify server registration, the rendered root response, response headers, linked UI assets, and the `404` path.
