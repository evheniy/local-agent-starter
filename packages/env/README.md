# Env

Required environment readers shared by the API and UI workspaces.

## Exports

- `getApi()` reads `API`.
- `getCdn()` reads `CDN`.
- `getUi()` reads `UI`.

Each getter throws when its environment variable is missing.

## Usage

```ts
import { getApi, getCdn, getUi } from '@p/env';

const apiOrigin = getApi();
const cdnOrigin = getCdn();
const uiOrigin = getUi();
```

## Local Defaults

Workspace scripts source `workspaces/env.sh`, which provides local defaults:

- `API_PORT=3000`
- `CDN_PORT=3001`
- `UI_PORT=3002`
- `API=http://localhost:$API_PORT`
- `CDN=http://localhost:$CDN_PORT`
- `UI=http://localhost:$UI_PORT`

Override these variables before running a workspace script when a different origin or port is needed.

## Notes

- The package is private to this repository.
- The public entry point re-exports from `env.ts`.
- The getters are thin wrappers around `@vyriy/env` and keep environment access explicit at call sites.
