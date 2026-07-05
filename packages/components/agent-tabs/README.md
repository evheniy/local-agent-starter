# AgentTabs

`AgentTabs` switches between the local agent chat and upload modes.

## Usage

```tsx
import { AgentTabs } from './agent-tabs.js';

export const Example = () => <AgentTabs value="chat" onValueChange={(value) => console.log(value)} />;
```

## Props

```ts
export type AgentTabsProps = {
  value: AgentTabsValue;
  onValueChange?: (value: AgentTabsValue) => void;
} & ComponentProps<'div'>;
```

## Accessibility

Tabs use `role="tablist"` and `role="tab"` with `aria-selected`.
