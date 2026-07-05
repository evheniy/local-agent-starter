# ChatPanel

`ChatPanel` renders the presentational chat controls for asking a question and
showing an answer placeholder.

## Usage

```tsx
import { ChatPanel } from './chat-panel.js';

export const Example = () => <ChatPanel onSubmit={(question) => console.log(question)} />;
```

## Props

```ts
export type ChatPanelProps = {
  defaultQuestion?: string;
  answer?: string;
  isLoading?: boolean;
  error?: string;
  onSubmit?: (question: string) => void | Promise<void>;
} & Omit<ComponentProps<'section'>, 'onSubmit'>;
```

## Notes

- API calls are intentionally not implemented here.
- The answer area is ready for future streamed output.
