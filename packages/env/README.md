# Env

Required environment readers shared by the API and UI workspaces.

## Exports

- `getApi()` reads `API`.
- `getDocsDir()` reads `DOCS_DIR` with local and Docker defaults.
- `getUi()` reads `UI`.

Origin getters throw when their environment variable is missing.

## Usage

```ts
import { getApi, getDocsDir, getUi } from '@p/env';

const apiOrigin = getApi();
const docsDir = getDocsDir();
const uiOrigin = getUi();
```

## Local Defaults

Workspace scripts source `workspaces/env.sh`, which provides local defaults:

- `API_PORT=3000`
- `UI_PORT=3001`
- `API=http://localhost:$API_PORT`
- `UI=http://localhost:$UI_PORT`
- `DOCS_DIR=$PWD/docker/docs`

Override these variables before running a workspace script when a different origin or port is needed.

## Notes

- The package is private to this repository.
- The public entry point re-exports from `env.ts`.
- The getters are thin wrappers around `@vyriy/env` and keep environment access explicit at call sites.
