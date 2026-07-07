import { describe, expect, it, jest } from '@jest/globals';

import { createIndexUploadedFile, UploadedFileNotFoundError } from './indexUploadedFile.js';
import { UnsupportedFileTypeError } from './readUploadedFileText.js';

import type { IndexUploadedFileDependencies } from './types.js';

const file = {
  id: 'file-1',
  name: 'notes.md',
  path: 'docs/notes.md',
  status: 'uploaded' as const,
};

const createDependencies = (): IndexUploadedFileDependencies => ({
  getUploadedFileById: jest.fn(() => Promise.resolve(file)),
  updateUploadedFileStatus: jest.fn(() => Promise.resolve(file)),
  markUploadedFileIndexed: jest.fn(() =>
    Promise.resolve({
      ...file,
      status: 'indexed' as const,
      chunksCount: 2,
    }),
  ),
  deleteRagDocumentByFileId: jest.fn(() => Promise.resolve()),
  createRagDocument: jest.fn(() =>
    Promise.resolve({
      id: 'document-1',
      fileId: file.id,
      title: file.name,
      source: file.name,
      path: file.path,
      metadata: {},
    }),
  ),
  createRagChunk: jest.fn(() => Promise.resolve()),
  createEmbedding: jest.fn((input) => Promise.resolve(input === 'first' ? [1, 0] : [0, 1])),
  readUploadedFileText: jest.fn(() => Promise.resolve('first second')),
  splitText: jest.fn(() => [
    {
      index: 0,
      content: 'first',
      startOffset: 0,
      endOffset: 5,
    },
    {
      index: 1,
      content: 'second',
      startOffset: 6,
      endOffset: 12,
    },
  ]),
});

describe('indexUploadedFile', () => {
  it('indexes an uploaded file and stores embedded chunks', async () => {
    const dependencies = createDependencies();
    const indexUploadedFile = createIndexUploadedFile(dependencies);

    await expect(indexUploadedFile({ fileId: file.id })).resolves.toEqual({
      fileId: file.id,
      documentId: 'document-1',
      chunksCount: 2,
    });
    expect(dependencies.getUploadedFileById).toHaveBeenCalledWith(file.id);
    expect(dependencies.updateUploadedFileStatus).toHaveBeenNthCalledWith(1, {
      id: file.id,
      status: 'indexing',
    });
    expect(dependencies.readUploadedFileText).toHaveBeenCalledWith(file);
    expect(dependencies.splitText).toHaveBeenCalledWith('first second');
    expect(dependencies.deleteRagDocumentByFileId).toHaveBeenCalledWith(file.id);
    expect(dependencies.createRagDocument).toHaveBeenCalledWith({
      fileId: file.id,
      title: file.name,
      source: file.name,
      path: file.path,
      content: 'first second',
      metadata: {
        fileId: file.id,
        fileName: file.name,
        path: file.path,
      },
    });
    expect(dependencies.createEmbedding).toHaveBeenCalledWith('first');
    expect(dependencies.createEmbedding).toHaveBeenCalledWith('second');
    expect(dependencies.createRagChunk).toHaveBeenNthCalledWith(1, {
      documentId: 'document-1',
      chunkIndex: 0,
      content: 'first',
      embedding: [
        1,
        0,
      ],
      metadata: {
        fileId: file.id,
        fileName: file.name,
        path: file.path,
        startOffset: 0,
        endOffset: 5,
      },
    });
    expect(dependencies.markUploadedFileIndexed).toHaveBeenCalledWith({
      id: file.id,
      chunksCount: 2,
    });
  });

  it('throws when uploaded file metadata is missing', async () => {
    const dependencies = createDependencies();
    dependencies.getUploadedFileById = jest.fn(() => Promise.resolve(undefined));
    const indexUploadedFile = createIndexUploadedFile(dependencies);

    await expect(indexUploadedFile({ fileId: 'missing' })).rejects.toThrow(new UploadedFileNotFoundError('missing'));
    expect(dependencies.updateUploadedFileStatus).not.toHaveBeenCalled();
  });

  it('sets status to error for unsupported files', async () => {
    const dependencies = createDependencies();
    dependencies.readUploadedFileText = jest.fn(() => Promise.reject(new UnsupportedFileTypeError('.pdf')));
    const indexUploadedFile = createIndexUploadedFile(dependencies);

    await expect(indexUploadedFile({ fileId: file.id })).rejects.toThrow(
      'Unsupported file type for text indexing: .pdf',
    );
    expect(dependencies.updateUploadedFileStatus).toHaveBeenLastCalledWith({
      id: file.id,
      status: 'error',
    });
  });

  it('sets status to error when embedding creation fails', async () => {
    const dependencies = createDependencies();
    dependencies.createEmbedding = jest.fn(() =>
      Promise.reject(new Error('Embedding dimension mismatch: expected 1024, got 768')),
    );
    const indexUploadedFile = createIndexUploadedFile(dependencies);

    await expect(indexUploadedFile({ fileId: file.id })).rejects.toThrow(
      'Embedding dimension mismatch: expected 1024, got 768',
    );
    expect(dependencies.updateUploadedFileStatus).toHaveBeenLastCalledWith({
      id: file.id,
      status: 'error',
    });
  });
});
