import { readFile } from 'node:fs/promises';
import { basename, extname } from 'node:path';

import { path } from '@vyriy/path';

import { getDocsDir } from '@p/env';

import type { ReadUploadedFileTextType } from './types.js';

const SUPPORTED_TEXT_EXTENSIONS = new Set([
  '.txt',
  '.md',
  '.mdx',
  '.json',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.scss',
  '.html',
  '.xml',
  '.yml',
  '.yaml',
  '.csv',
]);

export class UnsupportedFileTypeError extends Error {
  constructor(extension: string) {
    super(`Unsupported file type for text indexing: ${extension || 'unknown'}`);
    this.name = 'UnsupportedFileTypeError';
  }
}

const getStoredFilename = (storedPath: string) => storedPath.replace(/^docs[\\/]/u, '') || basename(storedPath);

/** Reads text for a supported uploaded file from DOCS_DIR. */
export const readUploadedFileText: ReadUploadedFileTextType = async (file) => {
  const extension = extname(file.name || file.path).toLowerCase();

  if (!SUPPORTED_TEXT_EXTENSIONS.has(extension)) {
    throw new UnsupportedFileTypeError(extension);
  }

  return readFile(path(getDocsDir(), getStoredFilename(file.path)), 'utf8');
};
