import { mkdir, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';

import type { Handler } from '@vyriy/router';

const DEFAULT_DOCS_DIR = process.env.NODE_ENV === 'production' ? '/app/docs' : join(process.cwd(), 'docker', 'docs');

const JSON_HEADERS = {
  'access-control-allow-origin': '*',
  'content-type': 'application/json; charset=utf-8',
  'x-content-type-options': 'nosniff',
};

const getDocsDir = () => process.env.DOCS_DIR ?? DEFAULT_DOCS_DIR;

const getHeader = (headers: Record<string, string | undefined> | undefined, name: string) => {
  const normalizedName = name.toLowerCase();

  return Object.entries(headers ?? {}).find(([key]) => key.toLowerCase() === normalizedName)?.[1];
};

const getContentDispositionFilename = (contentDisposition: string | undefined) => {
  const match = /(?:^|;\s*)filename="?(?<filename>[^";]+)"?/u.exec(contentDisposition ?? '');

  return match?.groups?.filename;
};

const sanitizeFilename = (filename: string | undefined) => {
  const normalized = basename(filename?.trim() || `upload-${Date.now()}.txt`).replaceAll(/[^\w.-]+/gu, '-');

  return normalized || `upload-${Date.now()}.txt`;
};

const resolveUploadPath = (filename: string) => {
  const docsDir = resolve(getDocsDir());
  const filePath = resolve(docsDir, filename);

  return { docsDir, filePath };
};

const getUploadBody = (body: string | undefined, isBase64Encoded?: boolean) => {
  if (!body) {
    return undefined;
  }

  return isBase64Encoded ? Buffer.from(body, 'base64') : Buffer.from(body);
};

export const upload: Handler = async ({ body, event, headers, query }) => {
  const content = getUploadBody(body, event.isBase64Encoded);

  if (!content?.byteLength) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        message: 'Upload body is required.',
      }),
    };
  }

  const filename = sanitizeFilename(
    query?.filename ??
      getHeader(headers, 'x-file-name') ??
      getContentDispositionFilename(getHeader(headers, 'content-disposition')),
  );
  const { docsDir, filePath } = resolveUploadPath(filename);

  await mkdir(docsDir, { recursive: true });
  await writeFile(filePath, content);

  return {
    statusCode: 201,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      ok: true,
      filename,
      path: `docs/${filename}`,
      bytes: content.byteLength,
    }),
  };
};
