import { z } from 'zod';

import { retrieveRelevantChunks as retrieveStoredRelevantChunks } from '@p/services';
import { jsonToolResult } from './results.js';

import type { CreateSearchDocumentsToolOptions, ToolDefinition } from './types.js';

const inputSchema = {
  query: z.string().trim().min(1),
  limit: z.number().int().min(1).max(10).optional(),
};

export const createSearchDocumentsTool = ({
  retrieveRelevantChunks = retrieveStoredRelevantChunks,
}: CreateSearchDocumentsToolOptions = {}) =>
  ({
    name: 'search_documents',
    description: 'Search indexed local documents and return relevant chunks with source metadata.',
    inputSchema,
    handler: async (input) => {
      const request = z.object(inputSchema).parse(input);
      const results = await retrieveRelevantChunks({
        message: request.query,
        limit: request.limit ?? 5,
      });

      return jsonToolResult({
        results: results.map(({ documentTitle, path, chunkIndex, score, content }) => ({
          documentTitle,
          path,
          chunkIndex,
          score,
          content,
        })),
      });
    },
  }) satisfies ToolDefinition<typeof inputSchema>;

export const searchDocumentsTool = createSearchDocumentsTool();
