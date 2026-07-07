import { describe, expect, it, jest } from '@jest/globals';

import {
  claimNextRagIndexJob,
  completeRagIndexJob,
  createRagChunk,
  createRagDocument,
  createUploadedFile,
  deleteRagDocumentByFileId,
  enqueueRagIndexJob,
  ensureRagIndexJobsSchema,
  ensureRagIndexSchema,
  ensureUploadedFilesSchema,
  failRagIndexJob,
  getUploadedFileById,
  getUploadedFileByPath,
  listUploadedFiles,
  markUploadedFileIndexed,
  updateUploadedFileStatus,
} from './actions.js';

import type { QueryType } from './types.js';

const mockEnsureUploadedFilesSchema = (query: jest.Mock<QueryType>) => {
  query.mockResolvedValueOnce({ rows: [] });
  query.mockResolvedValueOnce({ rows: [] });
  query.mockResolvedValueOnce({ rows: [] });
  query.mockResolvedValueOnce({ rows: [] });
};

const mockEnsureRagIndexJobsSchema = (query: jest.Mock<QueryType>) => {
  mockEnsureUploadedFilesSchema(query);
  query.mockResolvedValueOnce({ rows: [] });
  query.mockResolvedValueOnce({ rows: [] });
  query.mockResolvedValueOnce({ rows: [] });
};

const uploadedFileRow = {
  id: 10,
  name: 'notes.md',
  path: 'docs/notes.md',
  size: 12,
  type: null,
  status: 'uploaded',
  chunks_count: null,
};

describe('postgres actions', () => {
  it('creates uploaded file metadata', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
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
    expect(query).toHaveBeenCalledWith('CREATE EXTENSION IF NOT EXISTS vector');
    expect(query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_files'));
    expect(query).toHaveBeenNthCalledWith(5, expect.stringContaining('INSERT INTO rag_files'), [
      'notes.md',
      'docs/notes.md',
      5,
      null,
    ]);
  });

  it('lists uploaded file metadata', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
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
    expect(query).toHaveBeenNthCalledWith(5, expect.stringContaining('FROM rag_files'));
  });

  it('finds uploaded file metadata by path', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [uploadedFileRow],
    });

    await expect(getUploadedFileByPath(query)('docs/notes.md')).resolves.toEqual({
      id: '10',
      name: 'notes.md',
      path: 'docs/notes.md',
      size: 12,
      status: 'uploaded',
    });
    expect(query).toHaveBeenNthCalledWith(5, expect.stringContaining('WHERE path = $1'), ['docs/notes.md']);
  });

  it('returns undefined when uploaded file metadata is missing by path', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(getUploadedFileByPath(query)('docs/missing.md')).resolves.toBeUndefined();
  });

  it('finds uploaded file metadata by id', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          ...uploadedFileRow,
          chunks_count: 0,
        },
      ],
    });

    await expect(getUploadedFileById(query)('10')).resolves.toEqual({
      id: '10',
      name: 'notes.md',
      path: 'docs/notes.md',
      size: 12,
      status: 'uploaded',
      chunksCount: 0,
    });
    expect(query).toHaveBeenNthCalledWith(5, expect.stringContaining('WHERE id = $1'), ['10']);
  });

  it('returns undefined when uploaded file metadata is missing by id', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(getUploadedFileById(query)('missing')).resolves.toBeUndefined();
  });

  it('ensures uploaded file schema', async () => {
    const query = jest.fn<QueryType>().mockResolvedValue({
      rows: [],
    });

    await ensureUploadedFilesSchema(query)();

    expect(query).toHaveBeenNthCalledWith(1, 'CREATE EXTENSION IF NOT EXISTS vector');
    expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_files'));
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining('CREATE INDEX IF NOT EXISTS rag_files_created_at_idx'),
    );
    expect(query).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining('CREATE UNIQUE INDEX IF NOT EXISTS rag_files_path_idx'),
    );
  });

  it('ensures RAG index schema', async () => {
    const query = jest.fn<QueryType>().mockResolvedValue({
      rows: [],
    });

    await ensureRagIndexSchema(query)();

    expect(query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_documents'));
    expect(query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_chunks'));
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE rag_documents ADD COLUMN IF NOT EXISTS metadata'),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('ALTER TABLE rag_chunks ADD COLUMN IF NOT EXISTS metadata'),
    );
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE UNIQUE INDEX IF NOT EXISTS rag_chunks_document_chunk_idx'),
    );
  });

  it('ensures RAG index job schema', async () => {
    const query = jest.fn<QueryType>().mockResolvedValue({
      rows: [],
    });

    await ensureRagIndexJobsSchema(query)();

    expect(query).toHaveBeenCalledWith(expect.stringContaining('CREATE TABLE IF NOT EXISTS rag_index_jobs'));
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining('CREATE UNIQUE INDEX IF NOT EXISTS rag_index_jobs_active_file_idx'),
    );
    expect(query).toHaveBeenCalledWith(expect.stringContaining('CREATE INDEX IF NOT EXISTS rag_index_jobs_queue_idx'));
  });

  it('updates uploaded file status', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          ...uploadedFileRow,
          status: 'indexing',
          chunks_count: 0,
        },
      ],
    });

    await expect(updateUploadedFileStatus(query)({ id: '10', status: 'indexing' })).resolves.toMatchObject({
      id: '10',
      status: 'indexing',
    });
    expect(query).toHaveBeenNthCalledWith(5, expect.stringContaining('UPDATE rag_files'), [
      '10',
      'indexing',
    ]);
  });

  it('returns undefined when status update does not find a file', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(updateUploadedFileStatus(query)({ id: 'missing', status: 'error' })).resolves.toBeUndefined();
  });

  it('marks uploaded file indexed', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          ...uploadedFileRow,
          status: 'indexed',
          chunks_count: 3,
        },
      ],
    });

    await expect(markUploadedFileIndexed(query)({ id: '10', chunksCount: 3 })).resolves.toMatchObject({
      id: '10',
      status: 'indexed',
      chunksCount: 3,
    });
    expect(query).toHaveBeenNthCalledWith(5, expect.stringContaining("SET status = 'indexed', chunks_count = $2"), [
      '10',
      3,
    ]);
  });

  it('returns undefined when marking indexed does not find a file', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureUploadedFilesSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(markUploadedFileIndexed(query)({ id: 'missing', chunksCount: 0 })).resolves.toBeUndefined();
  });

  it('deletes RAG documents by uploaded file id', async () => {
    const query = jest.fn<QueryType>().mockResolvedValue({ rows: [] });

    await deleteRagDocumentByFileId(query)('10');

    expect(query).toHaveBeenLastCalledWith('DELETE FROM rag_documents WHERE file_id = $1', ['10']);
  });

  it('creates a RAG document', async () => {
    const query = jest.fn<QueryType>().mockResolvedValue({ rows: [] });

    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({ rows: [] });
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 99,
          file_id: 10,
          title: null,
          source: 'notes.md',
          path: 'docs/notes.md',
          metadata: null,
        },
      ],
    });

    await expect(
      createRagDocument(query)({
        fileId: '10',
        title: 'notes.md',
        source: 'notes.md',
        path: 'docs/notes.md',
        content: 'hello',
        metadata: {
          kind: 'test',
        },
      }),
    ).resolves.toEqual({
      id: '99',
      fileId: '10',
      title: 'notes.md',
      source: 'notes.md',
      path: 'docs/notes.md',
      metadata: {},
    });
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO rag_documents'), [
      '10',
      'notes.md',
      'notes.md',
      'docs/notes.md',
      'hello',
      JSON.stringify({
        kind: 'test',
      }),
    ]);
  });

  it('creates a RAG chunk', async () => {
    const query = jest.fn<QueryType>().mockResolvedValue({ rows: [] });

    await createRagChunk(query)({
      documentId: '99',
      chunkIndex: 1,
      content: 'hello',
      embedding: [
        0.1,
        0.2,
      ],
      metadata: {
        startOffset: 0,
      },
    });

    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('INSERT INTO rag_chunks'), [
      '99',
      1,
      'hello',
      JSON.stringify([
        0.1,
        0.2,
      ]),
      JSON.stringify({
        startOffset: 0,
      }),
    ]);
  });

  it('enqueues an indexing job after upload', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 21,
          file_id: 10,
          status: 'queued',
          attempts: 0,
          error: null,
        },
      ],
    });

    await expect(enqueueRagIndexJob(query)({ fileId: '10' })).resolves.toEqual({
      id: '21',
      fileId: '10',
      status: 'queued',
      attempts: 0,
    });
    expect(query).toHaveBeenNthCalledWith(8, expect.stringContaining('INSERT INTO rag_index_jobs'), ['10']);
  });

  it('returns an existing active indexing job instead of creating a duplicate', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 22,
          file_id: 10,
          status: 'running',
          attempts: 1,
          error: null,
        },
      ],
    });

    await expect(enqueueRagIndexJob(query)({ fileId: '10' })).resolves.toEqual({
      id: '22',
      fileId: '10',
      status: 'running',
      attempts: 1,
    });
    expect(query).toHaveBeenNthCalledWith(9, expect.stringContaining("status IN ('queued', 'running')"), ['10']);
  });

  it('claims the next queued indexing job', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 23,
          file_id: 10,
          status: 'running',
          attempts: 1,
          error: null,
        },
      ],
    });

    await expect(claimNextRagIndexJob(query)()).resolves.toEqual({
      id: '23',
      fileId: '10',
      status: 'running',
      attempts: 1,
    });
    expect(query).toHaveBeenNthCalledWith(8, expect.stringContaining('FOR UPDATE SKIP LOCKED'));
  });

  it('maps null indexing job attempts to zero', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 230,
          file_id: 10,
          status: 'running',
          attempts: null,
          error: null,
        },
      ],
    });

    await expect(claimNextRagIndexJob(query)()).resolves.toEqual({
      id: '230',
      fileId: '10',
      status: 'running',
      attempts: 0,
    });
  });

  it('returns undefined when no queued indexing job exists', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(claimNextRagIndexJob(query)()).resolves.toBeUndefined();
  });

  it('marks an indexing job completed', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 24,
          file_id: 10,
          status: 'completed',
          attempts: 1,
          error: null,
        },
      ],
    });

    await expect(completeRagIndexJob(query)({ id: '24' })).resolves.toMatchObject({
      id: '24',
      status: 'completed',
    });
    expect(query).toHaveBeenNthCalledWith(8, expect.stringContaining("SET status = 'completed'"), ['24']);
  });

  it('returns undefined when completed job is missing', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(completeRagIndexJob(query)({ id: 'missing' })).resolves.toBeUndefined();
  });

  it('marks an indexing job failed', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [
        {
          id: 25,
          file_id: 10,
          status: 'failed',
          attempts: 1,
          error: 'embedding offline',
        },
      ],
    });

    await expect(failRagIndexJob(query)({ id: '25', error: 'embedding offline' })).resolves.toEqual({
      id: '25',
      fileId: '10',
      status: 'failed',
      attempts: 1,
      error: 'embedding offline',
    });
    expect(query).toHaveBeenNthCalledWith(8, expect.stringContaining("SET status = 'failed'"), [
      '25',
      'embedding offline',
    ]);
  });

  it('returns undefined when failed job is missing', async () => {
    const query = jest.fn<QueryType>();

    mockEnsureRagIndexJobsSchema(query);
    query.mockResolvedValueOnce({
      rows: [],
    });

    await expect(failRagIndexJob(query)({ id: 'missing', error: 'no job' })).resolves.toBeUndefined();
  });
});
