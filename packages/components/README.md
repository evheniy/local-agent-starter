# Components

Reusable React components for the local agent starter. The package is private
to this repository and is consumed by the API and UI workspaces.

## Exports

Import the full public surface from `@p/components`:

- `AgentShell`
- `AgentTabs`
- `ChatPanel`
- `FileUploadPanel`
- `IndexedFilesList`
- `RetrievedChunks`
- `TracePanel`

Focused component entry points are also available:

```tsx
import { AgentShell } from '@p/components/agent-shell';
```

## Usage

```tsx
import { AgentShell } from '@p/components/agent-shell';
import '@p/components/styles.scss';

export const Example = () => <AgentShell />;
```

## Structure

Each public component lives in its own folder with:

- a focused `README.md`
- Storybook docs in `doc.mdx`
- stories for visual states
- behavior tests and public entry-point tests
- component-local SCSS

The package-level `index.ts` is a re-export surface only.

## Notes

- Components are SSR/SSG-friendly and avoid browser globals during render.
- Shared styles are exposed through `@p/components/styles.scss`.
- Public imports use ESM `.js` relative specifiers in TypeScript source.
