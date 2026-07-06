# AgentShell

`AgentShell` composes the local agent app layout with Chat and Upload tabs.

## Usage

```tsx
import { AgentShell } from './agent-shell.js';

export const Example = () => (
  <AgentShell tab="chat" chatPanel={{ question: 'What has been indexed?' }} uploadPanel={{}} />
);
```

## Props

```ts
export type AgentShellProps = {
  tab: AgentShellTab;
  chatPanel: ChatPanelProps;
  uploadPanel: FileUploadPanelProps;
  chunks?: RetrievedChunk[];
  files?: IndexedFile[];
  traceEvents?: TraceEvent[];
  onTabChange?: (tab: AgentShellTab) => void;
} & ComponentProps<'section'>;
```

## Notes

- The component is controlled by props.
- The full-page shell is top-aligned so it behaves like a regular website
  layout.
- Sample data lives in stories.
- State, API calls, and hooks live outside `packages/components`.
