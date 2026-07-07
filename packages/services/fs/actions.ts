import { mkdir, writeFile } from 'node:fs/promises';

import { path } from '@vyriy/path';

import { getDocsDir } from '@p/env';

import type { CreateUploadedFileTargetType, SaveUploadedFileType } from './types.js';

const getFilenameBase = (filename: string) => filename.split(/[\\/]/u).pop() || '';

const sanitizeFilename = (filename: string | undefined) => {
  const normalized = getFilenameBase(filename?.trim() || `upload-${Date.now()}.txt`).replaceAll(/[^\w.-]+/gu, '-');

  return normalized || `upload-${Date.now()}.txt`;
};

/** Creates a storage target for uploaded file content. */
export const createUploadedFileTarget: CreateUploadedFileTargetType = (filename) => {
  const safeFilename = sanitizeFilename(filename);
  const docsDir = path(getDocsDir());
  const filePath = path(docsDir, safeFilename);

  return {
    filename: safeFilename,
    path: `docs/${safeFilename}`,
    docsDir,
    filePath,
  };
};

/** Saves uploaded file content into local filesystem storage. */
export const saveUploadedFile: SaveUploadedFileType = async ({ content, filename, target }) => {
  const file = target ?? createUploadedFileTarget(filename);

  await mkdir(file.docsDir, { recursive: true });
  await writeFile(file.filePath, content);

  return {
    ...file,
    bytes: content.byteLength,
  };
};
