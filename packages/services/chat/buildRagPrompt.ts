import type { BuildRagPromptInput } from './types.js';
import type { ChatCompletionMessage } from '../llm/index.js';
import type { RagSource } from '../retrieval/index.js';

export const NO_CONTEXT_ANSWER =
  'I could not find indexed file content to answer from. Upload and index files, then ask again.';

const createSourceLabel = (chunk: RagSource, index: number) =>
  `[${index + 1}] ${chunk.documentTitle} (${chunk.path}, chunk ${chunk.chunkIndex}, score ${chunk.score.toFixed(3)})`;

export const buildRagPrompt = ({ message, chunks }: BuildRagPromptInput): ChatCompletionMessage[] => {
  if (chunks.length === 0) {
    return [
      {
        role: 'system',
        content: 'You answer questions only from indexed local file context.',
      },
      {
        role: 'user',
        content: `Question: ${message}\n\nNo indexed context was found. Reply exactly: ${NO_CONTEXT_ANSWER}`,
      },
    ];
  }

  const context = chunks
    .map((chunk, index) => [createSourceLabel(chunk, index), chunk.content].join('\n'))
    .join('\n\n');

  return [
    {
      role: 'system',
      content:
        'You are a local RAG assistant. Answer using only the provided indexed file context. If the context is insufficient, say what is missing. Keep the answer concise and cite sources by bracket number.',
    },
    {
      role: 'user',
      content: `Question: ${message}\n\nIndexed file context:\n${context}`,
    },
  ];
};
