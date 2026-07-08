import { getLlmBaseUrl, getLlmModel } from '@p/env';

import { createChatCompletionsUrl } from './createChatCompletionsUrl.js';
import { validateChatCompletion } from './validateChatCompletion.js';

import type { ChatCompletionResponse, CreateChatCompletionInput } from './types.js';

/** Creates a non-streaming chat completion through an OpenAI-compatible endpoint. */
export const createChatCompletion = async ({
  messages,
  model = getLlmModel(),
  baseUrl = getLlmBaseUrl(),
  fetch: fetchCompletion = fetch,
}: CreateChatCompletionInput): Promise<string> => {
  const response = await fetchCompletion(createChatCompletionsUrl(baseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`Chat completion request failed with ${response.status}: ${body}`);
  }

  return validateChatCompletion((await response.json()) as ChatCompletionResponse);
};
