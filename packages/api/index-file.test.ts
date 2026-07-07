import { describe, expect, it, jest } from '@jest/globals';

import { createIndexFileHandler } from './index-file.js';

import { UnsupportedFileTypeError, UploadedFileNotFoundError } from '@p/services';

import type { HandlerParams } from '@vyriy/router';
import type { IndexUploadedFileType } from '@p/services';

describe('index file handler', () => {
  const createParams = (id?: string): HandlerParams =>
    ({
      pathParameters: id ? { id } : undefined,
      query: {},
    }) as unknown as HandlerParams;

  it('returns 400 when id is missing', async () => {
    const indexFile = createIndexFileHandler();

    await expect(indexFile(createParams())).resolves.toEqual({
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        error: 'File id is required.',
      }),
    });
  });

  it('returns 404 when uploaded file metadata does not exist', async () => {
    const indexUploadedFile = jest.fn<IndexUploadedFileType>(() =>
      Promise.reject(new UploadedFileNotFoundError('missing')),
    );
    const indexFile = createIndexFileHandler({ indexUploadedFile });

    await expect(indexFile(createParams('missing'))).resolves.toEqual({
      statusCode: 404,
      body: JSON.stringify({
        ok: false,
        error: 'Uploaded file not found: missing',
      }),
    });
  });

  it('returns 200 with indexing output', async () => {
    const indexUploadedFile = jest.fn<IndexUploadedFileType>(() =>
      Promise.resolve({
        fileId: 'file-1',
        documentId: 'document-1',
        chunksCount: 2,
      }),
    );
    const indexFile = createIndexFileHandler({ indexUploadedFile });

    await expect(indexFile(createParams('file-1'))).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify({
        ok: true,
        fileId: 'file-1',
        documentId: 'document-1',
        chunksCount: 2,
      }),
    });
    expect(indexUploadedFile).toHaveBeenCalledWith({
      fileId: 'file-1',
    });
  });

  it('returns 415 for unsupported files', async () => {
    const indexUploadedFile = jest.fn<IndexUploadedFileType>(() =>
      Promise.reject(new UnsupportedFileTypeError('.pdf')),
    );
    const indexFile = createIndexFileHandler({ indexUploadedFile });

    await expect(indexFile(createParams('file-1'))).resolves.toEqual({
      statusCode: 415,
      body: JSON.stringify({
        ok: false,
        error: 'Unsupported file type for text indexing: .pdf',
      }),
    });
  });

  it('returns 500 for unexpected indexing failures', async () => {
    const indexUploadedFile = jest.fn<IndexUploadedFileType>(() => Promise.reject(new Error('embedding offline')));
    const indexFile = createIndexFileHandler({ indexUploadedFile });

    await expect(indexFile(createParams('file-1'))).resolves.toEqual({
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: 'embedding offline',
      }),
    });
  });

  it('returns a fallback message for non-error failures', async () => {
    const indexUploadedFile = jest.fn<IndexUploadedFileType>(
      () =>
        new Promise((resolve, reject) => {
          void resolve;
          const rejectUnknown: (reason?: unknown) => void = reject;

          rejectUnknown('offline');
        }),
    );
    const indexFile = createIndexFileHandler({ indexUploadedFile });

    await expect(indexFile(createParams('file-1'))).resolves.toEqual({
      statusCode: 500,
      body: JSON.stringify({
        ok: false,
        error: 'Indexing failed.',
      }),
    });
  });

  it('accepts the file id from the query for direct handler reuse', async () => {
    const indexUploadedFile = jest.fn<IndexUploadedFileType>(() =>
      Promise.resolve({
        fileId: 'file-2',
        documentId: 'document-2',
        chunksCount: 1,
      }),
    );
    const indexFile = createIndexFileHandler({ indexUploadedFile });

    await expect(
      indexFile({
        pathParameters: undefined,
        query: {
          id: 'file-2',
        },
      } as unknown as HandlerParams),
    ).resolves.toMatchObject({
      statusCode: 200,
    });
    expect(indexUploadedFile).toHaveBeenCalledWith({
      fileId: 'file-2',
    });
  });
});
