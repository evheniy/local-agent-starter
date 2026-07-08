import { getApiBaseUrl } from './get-api-base-url.js';
import { getUploadErrorMessage } from './get-upload-error-message.js';

import type { UploadFileResponse } from './types.js';

export const uploadFile = async (file: File): Promise<UploadFileResponse['file']> => {
  const uploadUrl = new URL('/upload', getApiBaseUrl());

  uploadUrl.searchParams.set('filename', file.name);

  const response = await fetch(uploadUrl.toString(), {
    method: 'POST',
    headers: {
      'content-type': file.type || 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(await getUploadErrorMessage(response));
  }

  const body = (await response.json()) as UploadFileResponse;

  return body.file;
};
