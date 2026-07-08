import { dispatchStreamEvent } from './dispatch-stream-event.js';
import { parseEventBlock } from './parse-event-block.js';

import type { StreamChatInput } from './types.js';

export const processBufferedEvents = (buffer: string, handlers: StreamChatInput['handlers']) => {
  const blocks = buffer.split(/\r?\n\r?\n/u);
  const remainder = blocks.pop() as string;

  for (const block of blocks) {
    const streamEvent = parseEventBlock(block.trim());

    if (streamEvent) {
      dispatchStreamEvent(streamEvent, handlers);
    }
  }

  return remainder;
};
