import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it } from '@jest/globals';

import { readUploadedFileText, UnsupportedFileTypeError } from './readUploadedFileText.js';

describe('readUploadedFileText', () => {
  it('reads a supported uploaded text file from DOCS_DIR', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-index-docs-'));

    try {
      process.env.DOCS_DIR = docsDir;
      await writeFile(join(docsDir, 'notes.md'), 'hello notes');

      await expect(
        readUploadedFileText({
          id: '1',
          name: 'notes.md',
          path: 'docs/notes.md',
          status: 'uploaded',
        }),
      ).resolves.toBe('hello notes');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('rejects unsupported file extensions', async () => {
    await expect(
      readUploadedFileText({
        id: '1',
        name: 'notes.pdf',
        path: 'docs/notes.pdf',
        status: 'uploaded',
      }),
    ).rejects.toThrow(new UnsupportedFileTypeError('.pdf'));
  });

  it('reports unknown when an unsupported file has no extension', async () => {
    await expect(
      readUploadedFileText({
        id: '1',
        name: '',
        path: 'docs/LICENSE',
        status: 'uploaded',
      }),
    ).rejects.toThrow(new UnsupportedFileTypeError(''));
  });

  it('falls back to the path basename when the stored path prefix leaves an empty filename', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-index-docs-'));

    try {
      process.env.DOCS_DIR = docsDir;
      await writeFile(join(docsDir, 'docs'), 'loose text');

      await expect(
        readUploadedFileText({
          id: '1',
          name: 'loose.txt',
          path: 'docs/',
          status: 'uploaded',
        }),
      ).resolves.toBe('loose text');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });
});
