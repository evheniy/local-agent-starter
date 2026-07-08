import type { Handler } from '@vyriy/router';

import {
  createUploadedFileTarget as createStoredUploadedFileTarget,
  saveUploadedFile as saveStoredUploadedFile,
} from '@p/services/fs';
import {
  createUploadedFile as createStoredUploadedFile,
  enqueueRagIndexJob as enqueueStoredRagIndexJob,
  getUploadedFileByPath as getStoredUploadedFileByPath,
} from '@p/services/postgres';

import type { CreateUploadHandlerOptions } from './types.js';

const getHeader = (headers: Record<string, string | undefined> | undefined, name: string) => {
  const normalizedName = name.toLowerCase();

  return Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === normalizedName)?.[1];
};

const getContentDispositionFilename = (contentDisposition: string | undefined) => {
  const match = /(?:^|;\s*)filename="?(?<filename>[^";]+)"?/u.exec(contentDisposition ?? '');

  return match?.groups?.filename;
};

const getUploadBody = (body: string | undefined, isBase64Encoded?: boolean) => {
  if (!body) {
    return undefined;
  }

  return isBase64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body);
};

export const createUploadHandler = ({
  createUploadedFile = createStoredUploadedFile(),
  enqueueRagIndexJob = enqueueStoredRagIndexJob(),
  saveUploadedFile = saveStoredUploadedFile,
  getUploadedFileByPath = getStoredUploadedFileByPath(),
  createUploadedFileTarget = createStoredUploadedFileTarget,
}: CreateUploadHandlerOptions = {}): Handler => {
  return async ({ body, event, headers, query }) => {
    const content = getUploadBody(body, event.isBase64Encoded);

    if (!content?.byteLength) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Upload body is required.',
        }),
      };
    }

    const target = createUploadedFileTarget(
      query?.filename ??
        getHeader(headers, 'x-file-name') ??
        getContentDispositionFilename(getHeader(headers, 'content-disposition')),
    );
    const existingFile = await getUploadedFileByPath(target.path);

    if (existingFile) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: 'File already exists.',
          file: existingFile,
        }),
      };
    }

    const savedFile = await saveUploadedFile({ content, target });
    const file = await createUploadedFile({
      name: savedFile.filename,
      path: savedFile.path,
      size: savedFile.bytes,
      type: getHeader(headers, 'content-type'),
    });
    const indexingJob = await enqueueRagIndexJob({
      fileId: file.id,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        ok: true,
        filename: savedFile.filename,
        path: savedFile.path,
        bytes: savedFile.bytes,
        file,
        indexingJob,
      }),
    };
  };
};

export const upload = createUploadHandler();
