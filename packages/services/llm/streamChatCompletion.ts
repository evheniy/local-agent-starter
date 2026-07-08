import { getLlmBaseUrl, getLlmModel } from '@p/env';

import { createChatCompletionsUrl } from './createChatCompletionsUrl.js';

import type { ChatCompletionStreamChunk, StreamChatCompletionInput, StreamChatCompletionType } from './types.js';

const DEFAULT_STREAM_IDLE_MS = 10_000;
const STREAM_DONE = Symbol('STREAM_DONE');

const parseStreamDelta = (line: string): string | typeof STREAM_DONE | undefined => {
  const data = line.trim().replace(/^data:\s*/u, '');

  if (!data) {
    return undefined;
  }

  if (data === '[DONE]') {
    return STREAM_DONE;
  }

  let body: ChatCompletionStreamChunk;

  try {
    body = JSON.parse(data) as ChatCompletionStreamChunk;
  } catch {
    throw new Error('Chat completion stream returned invalid JSON.');
  }

  const content = body.choices?.[0]?.delta?.content;

  if (content === undefined) {
    return undefined;
  }

  if (typeof content !== 'string') {
    throw new Error('Chat completion stream delta content must be a string.');
  }

  return content;
};

const readWithIdleTimeout = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  streamIdleMs: number,
  hasReadChunk: boolean,
): Promise<ReadableStreamReadResult<Uint8Array> | undefined> => {
  if (!hasReadChunk) {
    return reader.read();
  }

  let timeout!: ReturnType<typeof setTimeout>;
  const idle = new Promise<undefined>((resolve) => {
    timeout = setTimeout(() => resolve(undefined), streamIdleMs);
  });
  const result = await Promise.race([reader.read(), idle]);

  clearTimeout(timeout);

  return result;
};

async function* readStreamDeltas(body: ReadableStream<Uint8Array>, streamIdleMs: number): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffered = '';
  let hasReadChunk = false;

  while (true) {
    const result = await readWithIdleTimeout(reader, streamIdleMs, hasReadChunk);

    if (!result) {
      await reader.cancel();
      break;
    }

    const { done, value } = result;

    hasReadChunk = true;

    buffered += decoder.decode(value, { stream: !done });
    const lines = buffered.split(/\r?\n/u);

    buffered = lines.pop() as string;

    for (const line of lines) {
      if (!line.trim().startsWith('data:')) {
        continue;
      }

      const delta = parseStreamDelta(line);

      if (delta === STREAM_DONE) {
        await reader.cancel();
        return;
      }

      if (delta) {
        yield delta;
      }
    }

    if (done) {
      break;
    }
  }

  if (buffered.trim().startsWith('data:')) {
    const delta = parseStreamDelta(buffered);

    if (delta === STREAM_DONE) {
      return;
    }

    if (delta) {
      yield delta;
    }
  }
}

/** Streams chat completion deltas from an OpenAI-compatible endpoint. */
export const streamChatCompletion: StreamChatCompletionType = async function* ({
  messages,
  model = getLlmModel(),
  baseUrl = getLlmBaseUrl(),
  fetch: fetchCompletion = fetch,
  streamIdleMs = DEFAULT_STREAM_IDLE_MS,
}: StreamChatCompletionInput): AsyncGenerator<string> {
  const response = await fetchCompletion(createChatCompletionsUrl(baseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(`Chat completion stream request failed with ${response.status}: ${body}`);
  }

  if (!response.body) {
    throw new Error('Chat completion stream response did not include a body.');
  }

  yield* readStreamDeltas(response.body, streamIdleMs);
};
