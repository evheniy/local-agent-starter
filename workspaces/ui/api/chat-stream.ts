import type { ChatStreamSource, StreamChatInput } from './types.js';

type StreamEvent = {
  event: string;
  data: unknown;
};

const getChatBaseUrl = () => process.env.CHAT ?? process.env.API ?? window.location.origin;
const getApiBaseUrl = () => process.env.API ?? window.location.origin;

const parseEventBlock = (block: string): StreamEvent | undefined => {
  const lines = block.split(/\r?\n/u);
  const event = lines
    .find((line) => line.startsWith('event:'))
    ?.slice('event:'.length)
    .trim();
  const dataText = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())
    .join('\n');

  if (!event || !dataText) {
    return undefined;
  }

  return {
    event,
    data: JSON.parse(dataText) as unknown,
  };
};

const isSourceArray = (value: unknown): value is ChatStreamSource[] => Array.isArray(value);

const dispatchStreamEvent = (streamEvent: StreamEvent, handlers: StreamChatInput['handlers']) => {
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

const processBufferedEvents = (buffer: string, handlers: StreamChatInput['handlers']) => {
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

const streamChatResponse = async ({
  message,
  limit,
  handlers,
  signal,
}: Required<Pick<StreamChatInput, 'handlers' | 'message'>> & Pick<StreamChatInput, 'limit' | 'signal'>) => {
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

const requestJsonChat = async ({
  message,
  limit,
  handlers,
  signal,
}: Required<Pick<StreamChatInput, 'handlers' | 'message'>> & Pick<StreamChatInput, 'limit' | 'signal'>) => {
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

const shouldFallbackToJsonChat = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false;
  }

  return true;
};

export const streamChat = async ({ message, limit = 5, handlers, signal }: StreamChatInput): Promise<void> => {
  try {
    await streamChatResponse({
      message,
      limit,
      handlers,
      signal,
    });
  } catch (error) {
    if (!shouldFallbackToJsonChat(error)) {
      throw error;
    }

    await requestJsonChat({
      message,
      limit,
      handlers,
      signal,
    });
  }
};
