import type { Handler } from '@vyriy/router';

import {
  indexUploadedFile as indexStoredUploadedFile,
  UnsupportedFileTypeError,
  UploadedFileNotFoundError,
} from '@p/services';

import type { IndexUploadedFileType } from '@p/services';

type CreateIndexFileHandlerOptions = {
  indexUploadedFile?: IndexUploadedFileType;
};

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Indexing failed.');

const getFailureStatusCode = (error: unknown) => {
  if (error instanceof UploadedFileNotFoundError) {
    return 404;
  }

  if (error instanceof UnsupportedFileTypeError) {
    return 415;
  }

  return 500;
};

export const createIndexFileHandler = ({
  indexUploadedFile = indexStoredUploadedFile,
}: CreateIndexFileHandlerOptions = {}): Handler => {
  return async ({ pathParameters, query }) => {
    const fileId = pathParameters?.id ?? query?.id;

    if (!fileId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          ok: false,
          error: 'File id is required.',
        }),
      };
    }

    try {
      const result = await indexUploadedFile({ fileId });

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          fileId: result.fileId,
          documentId: result.documentId,
          chunksCount: result.chunksCount,
        }),
      };
    } catch (error) {
      return {
        statusCode: getFailureStatusCode(error),
        body: JSON.stringify({
          ok: false,
          error: getErrorMessage(error),
        }),
      };
    }
  };
};

export const indexFile = createIndexFileHandler();
