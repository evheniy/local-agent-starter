import { z } from 'zod';

import { ragChat as runStoredRagChat } from '@p/services';
import { jsonToolResult } from './results.js';

import type { CreateAskDocumentsToolOptions, ToolDefinition } from './types.js';

const inputSchema = {
  question: z.string().trim().min(1),
  limit: z.number().int().min(1).max(10).optional(),
};

export const createAskDocumentsTool = ({ ragChat = runStoredRagChat }: CreateAskDocumentsToolOptions = {}) =>
  ({
    name: 'ask_documents',
    description: 'Ask a question over indexed local documents and return an answer with sources.',
    inputSchema,
    handler: async (input) => {
      const request = z.object(inputSchema).parse(input);
      const response = await ragChat({
        message: request.question,
        limit: request.limit ?? 5,
      });

      return jsonToolResult({
        answer: response.answer,
        sources: response.sources.map(({ documentTitle, path, chunkIndex, score }) => ({
          documentTitle,
          path,
          chunkIndex,
          score,
        })),
      });
    },
  }) satisfies ToolDefinition<typeof inputSchema>;

export const askDocumentsTool = createAskDocumentsTool();
