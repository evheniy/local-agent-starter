import type { Handler } from '@vyriy/router';

import { listUploadedFiles as createListUploadedFiles } from '@p/services/postgres';

import type { ListUploadedFiles } from './types.js';

export const createFilesHandler = (listUploadedFiles: ListUploadedFiles = createListUploadedFiles()): Handler => {
  return async () => {
    const files = await listUploadedFiles();

    return {
      statusCode: 200,
      body: JSON.stringify({
        files,
      }),
    };
  };
};

export const files = createFilesHandler();
