import { createChatCompletion as createStoredChatCompletion } from '../llm/index.js';
import { retrieveRelevantChunks as retrieveStoredRelevantChunks } from '../retrieval/index.js';
import { buildRagPrompt } from './buildRagPrompt.js';
import { formatRagSources } from './formatRagSources.js';

import type { RagChatDependencies, RagChatInput, RagChatType } from './types.js';

const createDefaultDependencies = (): RagChatDependencies => ({
  retrieveRelevantChunks: retrieveStoredRelevantChunks,
  createChatCompletion: createStoredChatCompletion,
});

export const createRagChat = (dependencies: Partial<RagChatDependencies> = {}): RagChatType => {
  const services = {
    ...createDefaultDependencies(),
    ...dependencies,
  };

  return async ({ message, limit }: RagChatInput) => {
    const chunks = await services.retrieveRelevantChunks({ message, limit });
    const answer = await services.createChatCompletion({
      messages: buildRagPrompt({
        message,
        chunks,
      }),
    });

    return {
      answer,
      sources: formatRagSources(chunks),
    };
  };
};

export const ragChat = createRagChat();
