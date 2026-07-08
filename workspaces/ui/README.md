# UI

Client-rendered workspace for the local agent starter application.

## Behavior

The UI entry point mounts `AgentShell` into `#root`.

The Local RAG UI provides:

- Document upload through `POST /upload?filename=<name>`.
- Uploaded file status from `GET /files`.
- Automatic refresh while files are uploaded or indexing.
- Streaming RAG chat through `POST /chat/stream`.
- Source previews under assistant answers.

The layout uses a documents panel for upload/status and a chat panel for
streaming answers. The trace panel describes visible application-level steps,
not hidden model thoughts.

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

- `UI_PORT=3001`
- `UI=http://localhost:3001`
- `API=http://localhost:3000`
- `CHAT=http://localhost:3002`

Run the full local application when the API, chat service, indexer, Postgres,
and UI bundle should all be available:

```bash
yarn dev
```

Manual local RAG UI test:

1. Start Postgres, API, indexer, chat, UI, a local embedding model, and a local
   chat LLM.
2. Open `http://localhost:3001`.
3. Upload `notes.md`.
4. Verify the file appears as Uploaded or Indexing.
5. Wait until the status is Ready.
6. Ask `What does this document say?`.
7. Verify the assistant streams an answer and sources appear under it.

## Build

```bash
yarn build:ui
```

The build emits the browser bundle and generated HTML into `dist/api/static` so
the API Docker image can serve SSR HTML and static assets together.

## Validation

```bash
yarn test:jest workspaces/ui
```

The tests verify API helpers, upload/status hooks, streaming chat state, and
that the entry point renders the local agent shell.
