import {
  createRagChunk as createStoredRagChunk,
  createRagDocument as createStoredRagDocument,
  deleteRagDocumentByFileId as deleteStoredRagDocumentByFileId,
  getUploadedFileById as getStoredUploadedFileById,
  markUploadedFileIndexed as markStoredUploadedFileIndexed,
  updateUploadedFileStatus as updateStoredUploadedFileStatus,
} from '../postgres/index.js';
import { createEmbedding as createStoredEmbedding } from '../embeddings/index.js';
import { readUploadedFileText as readStoredUploadedFileText } from './readUploadedFileText.js';
import { splitText as splitStoredText } from './splitText.js';

import type {
  IndexUploadedFileDependencies,
  IndexUploadedFileInput,
  IndexUploadedFileOutput,
  IndexUploadedFileType,
} from './types.js';

export class UploadedFileNotFoundError extends Error {
  constructor(fileId: string) {
    super(`Uploaded file not found: ${fileId}`);
    this.name = 'UploadedFileNotFoundError';
  }
}

const createDefaultDependencies = (): IndexUploadedFileDependencies => ({
  getUploadedFileById: getStoredUploadedFileById(),
  updateUploadedFileStatus: updateStoredUploadedFileStatus(),
  markUploadedFileIndexed: markStoredUploadedFileIndexed(),
  deleteRagDocumentByFileId: deleteStoredRagDocumentByFileId(),
  createRagDocument: createStoredRagDocument(),
  createRagChunk: createStoredRagChunk(),
  createEmbedding: (input) => createStoredEmbedding({ input }),
  readUploadedFileText: readStoredUploadedFileText,
  splitText: splitStoredText,
});

export const createIndexUploadedFile = (
  dependencies: Partial<IndexUploadedFileDependencies> = {},
): IndexUploadedFileType => {
  const services = {
    ...createDefaultDependencies(),
    ...dependencies,
  };

  return async ({ fileId }: IndexUploadedFileInput): Promise<IndexUploadedFileOutput> => {
    const file = await services.getUploadedFileById(fileId);

    if (!file) {
      throw new UploadedFileNotFoundError(fileId);
    }

    try {
      await services.updateUploadedFileStatus({
        id: file.id,
        status: 'indexing',
      });

      const text = await services.readUploadedFileText(file);
      const chunks = services.splitText(text);

      await services.deleteRagDocumentByFileId(file.id);
      const document = await services.createRagDocument({
        fileId: file.id,
        title: file.name,
        source: file.name,
        path: file.path,
        content: text,
        metadata: {
          fileId: file.id,
          fileName: file.name,
          path: file.path,
        },
      });

      for (const chunk of chunks) {
        const embedding = await services.createEmbedding(chunk.content);

        await services.createRagChunk({
          documentId: document.id,
          chunkIndex: chunk.index,
          content: chunk.content,
          embedding,
          metadata: {
            fileId: file.id,
            fileName: file.name,
            path: file.path,
            startOffset: chunk.startOffset,
            endOffset: chunk.endOffset,
          },
        });
      }

      await services.markUploadedFileIndexed({
        id: file.id,
        chunksCount: chunks.length,
      });

      return {
        fileId: file.id,
        documentId: document.id,
        chunksCount: chunks.length,
      };
    } catch (error) {
      await services.updateUploadedFileStatus({
        id: file.id,
        status: 'error',
      });

      throw error;
    }
  };
};

export const indexUploadedFile = createIndexUploadedFile();
