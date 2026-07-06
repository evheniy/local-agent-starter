# ChatPanel

`ChatPanel` renders the presentational chat controls for asking a question and
showing an answer placeholder.

## Usage

```tsx
import { ChatPanel } from './chat-panel.js';

export const Example = () => (
  <ChatPanel question="What has been indexed?" onQuestionChange={console.log} onSubmit={() => console.log('submit')} />
);
```

## Props

```ts
export type ChatPanelProps = {
  question: string;
  answer?: string;
  canSubmit?: boolean;
  isLoading?: boolean;
  error?: string;
  onQuestionChange?: (question: string) => void;
  onSubmit?: () => void | Promise<void>;
} & Omit<ComponentProps<'section'>, 'onSubmit'>;
```

## Notes

- API calls and state are intentionally not implemented here.
- The answer area is ready for future streamed output.
