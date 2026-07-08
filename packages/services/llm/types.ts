export type ChatCompletionMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type CreateChatCompletionInput = {
  messages: ChatCompletionMessage[];
  model?: string;
  baseUrl?: string;
  fetch?: typeof fetch;
};

export type CreateChatCompletionType = (input: CreateChatCompletionInput) => Promise<string>;

export type StreamChatCompletionInput = CreateChatCompletionInput & {
  streamIdleMs?: number;
};

export type StreamChatCompletionType = (input: StreamChatCompletionInput) => AsyncGenerator<string>;

export type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: unknown;
    };
  }>;
};

export type ChatCompletionStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: unknown;
    };
  }>;
};
