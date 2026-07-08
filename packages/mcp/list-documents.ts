import { z } from 'zod';

import { listUploadedFiles as listStoredUploadedFiles } from '@p/services';
import { jsonToolResult } from './results.js';

import type { CreateListDocumentsToolOptions, ToolDefinition } from './types.js';

const inputSchema = {
  status: z
    .enum([
      'uploaded',
      'indexing',
      'indexed',
      'error',
    ])
    .optional(),
};

export const createListDocumentsTool = ({
  listUploadedFiles = listStoredUploadedFiles(),
}: CreateListDocumentsToolOptions = {}) =>
  ({
    name: 'list_documents',
    description: 'List uploaded local documents with indexing status and chunk counts.',
    inputSchema,
    handler: async (input) => {
      const request = z.object(inputSchema).parse(input);
      const documents = await listUploadedFiles({
        status: request.status,
      });

      return jsonToolResult({
        documents: documents.map(({ id, name, path, status, chunksCount, createdAt }) => ({
          id,
          name,
          path,
          status,
          chunksCount,
          createdAt,
        })),
      });
    },
  }) satisfies ToolDefinition<typeof inputSchema>;

export const listDocumentsTool = createListDocumentsTool();
