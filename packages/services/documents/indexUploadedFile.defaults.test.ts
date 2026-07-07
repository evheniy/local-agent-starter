import { describe, expect, it, jest } from '@jest/globals';

const getUploadedFileById = jest.fn(() =>
  Promise.resolve({
    id: 'file-1',
    name: 'notes.md',
    path: 'docs/notes.md',
    status: 'uploaded' as const,
  }),
);
const updateUploadedFileStatus = jest.fn(() => Promise.resolve(undefined));
const markUploadedFileIndexed = jest.fn(() => Promise.resolve(undefined));
const deleteRagDocumentByFileId = jest.fn(() => Promise.resolve());
const createRagDocument = jest.fn(() =>
  Promise.resolve({
    id: 'document-1',
    fileId: 'file-1',
    title: 'notes.md',
    source: 'notes.md',
    path: 'docs/notes.md',
    metadata: {},
  }),
);
const createRagChunk = jest.fn((input: unknown) => {
  void input;

  return Promise.resolve();
});
const createEmbedding = jest.fn((input: unknown) => {
  void input;

  return Promise.resolve([
    0.1,
    0.2,
  ]);
});
const readUploadedFileText = jest.fn(() => Promise.resolve('hello'));
const splitText = jest.fn(() => [
  {
    index: 0,
    content: 'hello',
    startOffset: 0,
    endOffset: 5,
  },
]);

jest.mock('../postgres/index.js', () => ({
  createRagChunk: () => createRagChunk,
  createRagDocument: () => createRagDocument,
  deleteRagDocumentByFileId: () => deleteRagDocumentByFileId,
  getUploadedFileById: () => getUploadedFileById,
  markUploadedFileIndexed: () => markUploadedFileIndexed,
  updateUploadedFileStatus: () => updateUploadedFileStatus,
}));

jest.mock('../embeddings/index.js', () => ({
  createEmbedding,
}));

jest.mock('./readUploadedFileText.js', () => ({
  readUploadedFileText,
}));

jest.mock('./splitText.js', () => ({
  splitText,
}));

describe('indexUploadedFile defaults', () => {
  it('wires the default embedding service with chunk text input', async () => {
    const { indexUploadedFile } = await import('./indexUploadedFile.js');

    await expect(indexUploadedFile({ fileId: 'file-1' })).resolves.toEqual({
      fileId: 'file-1',
      documentId: 'document-1',
      chunksCount: 1,
    });
    expect(createEmbedding).toHaveBeenCalledWith({
      input: 'hello',
    });
    expect(createRagChunk).toHaveBeenCalledWith(
      expect.objectContaining({
        embedding: [
          0.1,
          0.2,
        ],
      }),
    );
  });
});
