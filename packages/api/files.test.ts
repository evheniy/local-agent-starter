import { describe, expect, it, jest } from '@jest/globals';

import { createFilesHandler } from './files.js';

describe('files handler', () => {
  it('returns uploaded files from storage', async () => {
    const listUploadedFiles = jest.fn(() =>
      Promise.resolve([
        {
          id: '1',
          name: 'notes.md',
          path: 'docs/notes.md',
          size: 5,
          type: 'text/markdown',
          status: 'uploaded' as const,
        },
      ]),
    );
    const files = createFilesHandler(listUploadedFiles);

    await expect(files({} as never)).resolves.toEqual({
      statusCode: 200,
      body: JSON.stringify({
        files: [
          {
            id: '1',
            name: 'notes.md',
            path: 'docs/notes.md',
            size: 5,
            type: 'text/markdown',
            status: 'uploaded',
          },
        ],
      }),
    });
    expect(listUploadedFiles).toHaveBeenCalledTimes(1);
  });
});
