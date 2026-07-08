import type { ChatCompletionResponse } from './types.js';

export const validateChatCompletion = (body: ChatCompletionResponse): string => {
  const content = body.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('Chat completion response did not include an answer.');
  }

  return content;
};
