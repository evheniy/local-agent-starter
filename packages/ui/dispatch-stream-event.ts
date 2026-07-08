import type { ChatStreamSource, StreamChatInput, StreamEvent } from './types.js';

const isSourceArray = (value: unknown): value is ChatStreamSource[] => Array.isArray(value);

export const dispatchStreamEvent = (streamEvent: StreamEvent, handlers: StreamChatInput['handlers']) => {
  const data = streamEvent.data;

  switch (streamEvent.event) {
    case 'sources':
      if (data && typeof data === 'object' && 'sources' in data && isSourceArray(data.sources)) {
        handlers.onSources?.(data.sources);
      }
      break;
    case 'answer_delta':
      if (data && typeof data === 'object' && 'text' in data && typeof data.text === 'string') {
        handlers.onDelta?.(data.text);
      }
      break;
    case 'done':
      handlers.onDone?.();
      break;
    case 'error':
      if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
        handlers.onError?.(data.error);
      } else {
        handlers.onError?.('Stream failed.');
      }
      break;
  }
};
