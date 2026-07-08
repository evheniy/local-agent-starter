import { getApiBaseUrl } from './get-api-base-url.js';

import type { FilesResponse } from './types.js';

export const listFiles = async (): Promise<FilesResponse['files']> => {
  const filesUrl = new URL('/files', getApiBaseUrl());
  const response = await fetch(filesUrl.toString());

  if (!response.ok) {
    throw new Error(`Could not load uploaded files. (${response.status})`);
  }

  const body = (await response.json()) as FilesResponse;

  return body.files;
};
