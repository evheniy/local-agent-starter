# UI

Client-rendered workspace for the local agent starter application.

## Behavior

The UI entry point mounts `AgentShell` into `#root`.

The UI has two modes:

1. Chat - ask questions and observe the visible application pipeline.
2. Upload - select local files that will later be sent to the ingest/indexing API.

The trace panel shows application-level steps, not hidden model thoughts.

It imports shared component styles from:

```ts
import '@p/components/styles.scss';
```

## Local Development

From the repository root:

```bash
yarn dev:ui
```

The script sources `workspaces/env.sh` and starts webpack dev server for `workspaces/ui/index.tsx`.

Default local values:

- `UI_PORT=3002`
- `UI=http://localhost:3002`
- `CDN=http://localhost:3001`

Run the full local application when the API, CDN assets, and UI bundle should all be available:

```bash
yarn start
```

## Build

```bash
yarn build:ui
```

The build emits the browser bundle and generated HTML into `dist/cdn`.

## Validation

```bash
yarn test:jest workspaces/ui
```

The tests verify that the entry point mounts into `#root` and renders the local agent shell.
