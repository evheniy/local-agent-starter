import { createChatCompletionsUrl } from './createChatCompletionsUrl.js';
import { validateChatCompletion } from './validateChatCompletion.js';

import type { ChatCompletionResponse, CreateChatCompletionInput } from './types.js';

const DEFAULT_LLM_BASE_URL = 'http://host.docker.internal:1234';
const DEFAULT_LLM_MODEL = 'local-model';

/** Creates a non-streaming chat completion through an OpenAI-compatible endpoint. */
export const createChatCompletion = async ({
  messages,
  model = process.env.LLM_MODEL ?? DEFAULT_LLM_MODEL,
  baseUrl = process.env.LLM_BASE_URL ?? DEFAULT_LLM_BASE_URL,
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
