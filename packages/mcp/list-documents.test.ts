import { describe, expect, it, jest } from '@jest/globals';

import { createListDocumentsTool } from './list-documents.js';

import type { ListUploadedFilesType } from '@p/services';

const readJsonResult = (text: string) => JSON.parse(text) as unknown;

describe('listDocumentsTool', () => {
  it('returns documents from storage', async () => {
    const listUploadedFiles = jest.fn<ListUploadedFilesType>(() =>
      Promise.resolve([
        {
          id: '1',
          name: 'notes.md',
          path: 'docs/notes.md',
          status: 'indexed',
          chunksCount: 12,
          createdAt: '2026-07-07T10:00:00.000Z',
        },
      ]),
    );
    const tool = createListDocumentsTool({ listUploadedFiles });

    const result = await tool.handler({});

    expect(readJsonResult(result.content[0]?.text ?? '')).toEqual({
      documents: [
        {
          id: '1',
          name: 'notes.md',
          path: 'docs/notes.md',
          status: 'indexed',
          chunksCount: 12,
          createdAt: '2026-07-07T10:00:00.000Z',
        },
      ],
    });
    expect(listUploadedFiles).toHaveBeenCalledWith({
      status: undefined,
    });
  });

  it('supports a status filter', async () => {
    const listUploadedFiles = jest.fn<ListUploadedFilesType>(() => Promise.resolve([]));
    const tool = createListDocumentsTool({ listUploadedFiles });

    await expect(tool.handler({ status: 'indexed' })).resolves.toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            documents: [],
          }),
        },
      ],
    });
    expect(listUploadedFiles).toHaveBeenCalledWith({
      status: 'indexed',
    });
  });

  it('rejects invalid status values', async () => {
    const listUploadedFiles = jest.fn<ListUploadedFilesType>();
    const tool = createListDocumentsTool({ listUploadedFiles });

    await expect(tool.handler({ status: 'deleted' } as never)).rejects.toThrow();
    expect(listUploadedFiles).not.toHaveBeenCalled();
  });
});
