import { getApiBaseUrl } from './get-api-base-url.js';

import type { ChatStreamSource, StreamChatRequest } from './types.js';

const isSourceArray = (value: unknown): value is ChatStreamSource[] => Array.isArray(value);

export const requestJsonChat = async ({ message, limit, handlers, signal }: StreamChatRequest) => {
  const chatUrl = new URL('/chat', getApiBaseUrl());
  const response = await fetch(chatUrl.toString(), {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      message,
      limit,
    }),
    signal,
  });
  const body = (await response.json()) as unknown;

  if (!response.ok) {
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      throw new Error(body.error);
    }

    throw new Error(`Chat request failed with status ${response.status}`);
  }

  if (body && typeof body === 'object') {
    if ('sources' in body && isSourceArray(body.sources)) {
      handlers.onSources?.(body.sources);
    }

    if ('answer' in body && typeof body.answer === 'string') {
      handlers.onDelta?.(body.answer);
    }
  }

  handlers.onDone?.();
};
