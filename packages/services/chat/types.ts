import type { RagSource, RetrieveRelevantChunksType } from '../retrieval/index.js';
import type { CreateChatCompletionType, StreamChatCompletionType } from '../llm/index.js';

export type RagChatSource = {
  documentTitle: string;
  path: string;
  chunkIndex: number;
  score: number;
  contentPreview: string;
};

export type RagChatInput = {
  message: string;
  limit?: number;
};

export type RagChatOutput = {
  answer: string;
  sources: RagChatSource[];
};

export type RagChatType = (input: RagChatInput) => Promise<RagChatOutput>;

export type RagChatDependencies = {
  retrieveRelevantChunks: RetrieveRelevantChunksType;
  createChatCompletion: CreateChatCompletionType;
};

export type RagChatStreamEvent =
  | {
      type: 'sources';
      sources: RagChatSource[];
    }
  | {
      type: 'answer_delta';
      text: string;
    }
  | {
      type: 'done';
      ok: true;
    }
  | {
      type: 'error';
      ok: false;
      error: string;
    };

export type StreamRagChatType = (input: RagChatInput) => AsyncGenerator<RagChatStreamEvent>;

export type StreamRagChatDependencies = {
  retrieveRelevantChunks: RetrieveRelevantChunksType;
  streamChatCompletion: StreamChatCompletionType;
};

export type BuildRagPromptInput = {
  message: string;
  chunks: RagSource[];
};
