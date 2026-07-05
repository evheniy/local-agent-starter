# AgentShell

`AgentShell` composes the local agent app layout with Chat and Upload tabs.

## Usage

```tsx
import { AgentShell } from './agent-shell.js';

export const Example = () => <AgentShell />;
```

## Props

```ts
export type AgentShellProps = {
  defaultTab?: AgentShellTab;
} & ComponentProps<'section'>;
```

## Notes

- Chat is the default tab.
- The first implementation uses sample data.
- API calls are intentionally left for future integration.
