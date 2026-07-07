import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, jest } from '@jest/globals';

import { createUploadedFileTarget, saveUploadedFile } from './actions.js';

describe('fs storage actions', () => {
  it('creates an uploaded file target without writing content', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-fs-'));

    try {
      process.env.DOCS_DIR = docsDir;

      expect(createUploadedFileTarget('../Target Notes.md')).toEqual({
        filename: 'Target-Notes.md',
        path: 'docs/Target-Notes.md',
        docsDir,
        filePath: join(docsDir, 'Target-Notes.md'),
      });
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('saves uploaded content with a sanitized basename', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-fs-'));

    try {
      process.env.DOCS_DIR = docsDir;

      const file = await saveUploadedFile({
        content: Buffer.from('hello storage'),
        filename: '../Header Notes.md',
      });

      expect(file).toEqual({
        filename: 'Header-Notes.md',
        path: 'docs/Header-Notes.md',
        bytes: 13,
        docsDir,
        filePath: join(docsDir, 'Header-Notes.md'),
      });
      await expect(readFile(file.filePath, 'utf8')).resolves.toBe('hello storage');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('saves uploaded content into a resolved target', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-fs-'));

    try {
      process.env.DOCS_DIR = docsDir;

      const target = createUploadedFileTarget('resolved.md');
      const file = await saveUploadedFile({
        content: Buffer.from('resolved target'),
        target,
      });

      expect(file).toEqual({
        ...target,
        bytes: 15,
      });
      await expect(readFile(target.filePath, 'utf8')).resolves.toBe('resolved target');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('generates a fallback filename when the provided filename is empty after sanitizing', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-fs-'));

    jest.spyOn(Date, 'now').mockReturnValue(123);

    try {
      process.env.DOCS_DIR = docsDir;

      const file = await saveUploadedFile({
        content: Buffer.from('fallback'),
        filename: '///',
      });

      expect(file).toMatchObject({
        filename: 'upload-123.txt',
        path: 'docs/upload-123.txt',
        bytes: 8,
      });
      await expect(readFile(file.filePath, 'utf8')).resolves.toBe('fallback');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('uses generated filenames when a filename is missing', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-fs-'));

    jest.spyOn(Date, 'now').mockReturnValue(456);

    try {
      process.env.DOCS_DIR = docsDir;

      const file = await saveUploadedFile({
        content: Buffer.from('generated'),
      });

      expect(file.filename).toBe('upload-456.txt');
      await expect(readFile(join(docsDir, 'upload-456.txt'), 'utf8')).resolves.toBe('generated');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });
});
