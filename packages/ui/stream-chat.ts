import { requestJsonChat } from './request-json-chat.js';
import { shouldFallbackToJsonChat } from './should-fallback-to-json-chat.js';
import { streamChatResponse } from './stream-chat-response.js';

import type { StreamChatInput } from './types.js';

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
