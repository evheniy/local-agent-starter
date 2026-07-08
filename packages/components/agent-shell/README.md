# AgentShell

`AgentShell` composes the local RAG app layout with a documents panel and a
chat panel. Tabs remain available for small screens.

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
  filesPanel?: Pick<IndexedFilesListProps, 'isRefreshing' | 'onRefresh'>;
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
