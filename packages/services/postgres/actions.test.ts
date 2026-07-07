import { describe, expect, it, jest } from '@jest/globals';

import { createUploadedFile, ensureUploadedFilesSchema, getUploadedFileByPath, listUploadedFiles } from './actions.js';

import type { QueryType } from './types.js';

describe('postgres actions', () => {
  it('creates uploaded file metadata', async () => {
    const query = jest
      .fn<QueryType>()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: '42',
            name: 'notes.md',
            path: 'docs/notes.md',
            size: '5',
            type: 'text/markdown',
            status: 'uploaded',
            chunks_count: null,
          },
        ],
      });

    await expect(
      createUploadedFile(query)({
        name: 'notes.md',
        path: 'docs/notes.md',
        size: 5,
      }),
    ).resolves.toEqual({
      id: '42',
      name: 'notes.md',
      path: 'docs/notes.md',
      size: 5,
      type: 'text/markdown',
      status: 'uploaded',
    });
    expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_files'));
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('CREATE INDEX IF NOT EXISTS rag_files_created_at_idx'),
    );
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('CREATE UNIQUE INDEX IF NOT EXISTS rag_files_path_idx'),
    );
    expect(query).toHaveBeenNthCalledWith(4, expect.stringContaining('INSERT INTO rag_files'), [
      'notes.md',
      'docs/notes.md',
      5,
      null,
    ]);
  });

  it('lists uploaded file metadata', async () => {
    const query = jest
      .fn<QueryType>()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 7,
            name: 'indexed.md',
            path: 'docs/indexed.md',
            size: null,
            type: null,
            status: 'indexed',
            chunks_count: 3,
          },
        ],
      });

    await expect(listUploadedFiles(query)()).resolves.toEqual([
      {
        id: '7',
        name: 'indexed.md',
        path: 'docs/indexed.md',
        status: 'indexed',
        chunksCount: 3,
      },
    ]);
    expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_files'));
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('CREATE INDEX IF NOT EXISTS rag_files_created_at_idx'),
    );
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('CREATE UNIQUE INDEX IF NOT EXISTS rag_files_path_idx'),
    );
    expect(query).toHaveBeenNthCalledWith(4, expect.stringContaining('FROM rag_files'));
  });

  it('finds uploaded file metadata by path', async () => {
    const query = jest
      .fn<QueryType>()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 9,
            name: 'notes.md',
            path: 'docs/notes.md',
            size: 12,
            type: null,
            status: 'uploaded',
            chunks_count: null,
          },
        ],
      });

    await expect(getUploadedFileByPath(query)('docs/notes.md')).resolves.toEqual({
      id: '9',
      name: 'notes.md',
      path: 'docs/notes.md',
      size: 12,
      status: 'uploaded',
    });
    expect(query).toHaveBeenNthCalledWith(4, expect.stringContaining('WHERE path = $1'), ['docs/notes.md']);
  });

  it('returns undefined when uploaded file metadata is missing by path', async () => {
    const query = jest
      .fn<QueryType>()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [],
      });

    await expect(getUploadedFileByPath(query)('docs/missing.md')).resolves.toBeUndefined();
  });

  it('ensures uploaded file schema', async () => {
    const query = jest.fn<QueryType>().mockResolvedValue({
      rows: [],
    });

    await ensureUploadedFilesSchema(query)();

    expect(query).toHaveBeenNthCalledWith(1, expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_files'));
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('CREATE INDEX IF NOT EXISTS rag_files_created_at_idx'),
    );
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('CREATE UNIQUE INDEX IF NOT EXISTS rag_files_path_idx'),
    );
  });
});
