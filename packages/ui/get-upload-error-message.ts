export const getUploadErrorMessage = async (response: Response): Promise<string> => {
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
