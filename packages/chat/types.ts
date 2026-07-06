export type ChatMessage = {
  role: 'assistant' | 'system' | 'user';
  content: string;
};

export type ChatRequest = {
  message?: string;
  messages?: ChatMessage[];
};

export type ChatStreamEvent =
  | {
      type: 'thinking';
      text: string;
    }
  | {
      type: 'delta';
      text: string;
    }
  | {
      type: 'final';
      text: string;
    };
