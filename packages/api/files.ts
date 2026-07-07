import type { Handler } from '@vyriy/router';

import { listUploadedFiles as createListUploadedFiles } from '@p/services/postgres';

import type { ListUploadedFilesType } from '@p/services/postgres';

export const createFilesHandler =
  (listUploadedFiles: ListUploadedFilesType = createListUploadedFiles()): Handler =>
  async () => {
    const files = await listUploadedFiles();

    return {
      statusCode: 200,
      body: JSON.stringify({
        files,
      }),
    };
  };

export const files = createFilesHandler();
