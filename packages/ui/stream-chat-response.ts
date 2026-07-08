import { getChatBaseUrl } from './get-chat-base-url.js';
import { dispatchStreamEvent } from './dispatch-stream-event.js';
import { parseEventBlock } from './parse-event-block.js';
import { processBufferedEvents } from './process-buffered-events.js';

import type { StreamChatRequest } from './types.js';

export const streamChatResponse = async ({ message, limit, handlers, signal }: StreamChatRequest) => {
  const streamUrl = new URL('/chat/stream', getChatBaseUrl());
  const response = await fetch(streamUrl.toString(), {
    method: 'POST',
    headers: {
      accept: 'text/event-stream',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      message,
      limit,
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(body || `Chat stream failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Chat stream response did not include a body.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    buffer += decoder.decode(value, { stream: !done });
    buffer = processBufferedEvents(buffer, handlers);

    if (done) {
      break;
    }
  }

  const finalEvent = parseEventBlock(buffer.trim());

  if (finalEvent) {
    dispatchStreamEvent(finalEvent, handlers);
  }
};
