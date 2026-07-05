# TracePanel

`TracePanel` renders visible application-level pipeline events for the local
agent flow.

## Usage

```tsx
import { TracePanel } from './trace-panel.js';

export const Example = () => <TracePanel events={[{ id: '1', title: 'Retrieve context', status: 'running' }]} />;
```

## Props

```ts
export type TracePanelProps = {
  events?: TraceEvent[];
} & ComponentProps<'aside'>;
```

## Notes

The trace panel shows application-level steps, not hidden model thoughts.
