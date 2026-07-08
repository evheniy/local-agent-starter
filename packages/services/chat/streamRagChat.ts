import { streamChatCompletion as streamStoredChatCompletion } from '../llm/index.js';
import { retrieveRelevantChunks as retrieveStoredRelevantChunks } from '../retrieval/index.js';
import { buildRagPrompt } from './buildRagPrompt.js';
import { formatRagSources } from './formatRagSources.js';

import type { RagChatInput, StreamRagChatDependencies, StreamRagChatType } from './types.js';

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Streaming chat request failed.');

const createDefaultDependencies = (): StreamRagChatDependencies => ({
  retrieveRelevantChunks: retrieveStoredRelevantChunks,
  streamChatCompletion: streamStoredChatCompletion,
});

export const createStreamRagChat = (dependencies: Partial<StreamRagChatDependencies> = {}): StreamRagChatType => {
  const services = {
    ...createDefaultDependencies(),
    ...dependencies,
  };

  return async function* ({ message, limit }: RagChatInput) {
    try {
      const chunks = await services.retrieveRelevantChunks({ message, limit });

      yield {
        type: 'sources',
        sources: formatRagSources(chunks),
      };

      const messages = buildRagPrompt({
        message,
        chunks,
      });

      for await (const text of services.streamChatCompletion({ messages })) {
        yield {
          type: 'answer_delta',
          text,
        };
      }

      yield {
        type: 'done',
        ok: true,
      };
    } catch (error) {
      yield {
        type: 'error',
        ok: false,
        error: getErrorMessage(error),
      };
    }
  };
};

export const streamRagChat = createStreamRagChat();
