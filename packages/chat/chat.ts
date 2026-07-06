import type { ChatRequest, ChatStreamEvent } from './types.js';

const DEFAULT_MESSAGE = 'Hello from Local Agent Chat';

const getLastUserMessage = (request: ChatRequest = {}) => {
  const directMessage = request.message?.trim();

  if (directMessage) {
    return directMessage;
  }

  return (
    [...(request.messages ?? [])]
      .reverse()
      .find((message) => message.role === 'user')
      ?.content.trim() ?? DEFAULT_MESSAGE
  );
};

export const createChatResponse = (request: ChatRequest = {}) => {
  const message = getLastUserMessage(request);

  return `Echo: ${message}`;
};

export async function* runChat(request: ChatRequest = {}): AsyncGenerator<ChatStreamEvent> {
  yield {
    type: 'thinking',
    text: 'Preparing chat response...',
  };
  await Promise.resolve();

  const response = createChatResponse(request);
  const words = response.split(/(\s+)/).filter(Boolean);

  for (const word of words) {
    yield {
      type: 'delta',
      text: word,
    };
  }

  yield {
    type: 'final',
    text: response,
  };
}
