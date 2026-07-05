# UI

Client-rendered demo workspace for the profile-card application.

## Behavior

The UI entry point mounts a `ProfileCard` into `#root` with the same demo data used by the API-rendered page.

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

The tests verify that the entry point mounts into `#root` and renders the demo `ProfileCard` props.
