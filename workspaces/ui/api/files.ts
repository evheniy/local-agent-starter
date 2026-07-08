import type { FilesResponse, UploadFileResponse } from './types.js';

const getApiBaseUrl = () => process.env.API ?? window.location.origin;

export const listFiles = async (): Promise<FilesResponse['files']> => {
  const filesUrl = new URL('/files', getApiBaseUrl());
  const response = await fetch(filesUrl.toString());

  if (!response.ok) {
    throw new Error(`Could not load uploaded files. (${response.status})`);
  }

  const body = (await response.json()) as FilesResponse;

  return body.files;
};

const getUploadErrorMessage = async (response: Response): Promise<string> => {
  let body: unknown;

  try {
    body = await response.json();
  } catch {
    body = undefined;
  }

  if (response.status === 409) {
    return 'This file is already uploaded.';
  }

  if (body && typeof body === 'object' && 'message' in body && typeof body.message === 'string') {
    return body.message;
  }

  return `Upload failed with status ${response.status}`;
};

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
