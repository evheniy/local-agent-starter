import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { listFiles } from './list-files.js';

const createResponse = ({
  body = {},
  ok = true,
  status = 200,
}: {
  body?: unknown;
  ok?: boolean;
  status?: number;
} = {}) =>
  ({
    json: jest.fn(() => Promise.resolve(body)),
    ok,
    status,
  }) as unknown as Response;

describe('listFiles', () => {
  const previousApi = process.env.API;

  beforeEach(() => {
    process.env.API = 'http://localhost:3000';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'fetch');

    if (previousApi === undefined) {
      delete process.env.API;
    } else {
      process.env.API = previousApi;
    }
  });

  it('lists files from the API', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: {
          files: [
            {
              id: '1',
              name: 'notes.md',
              path: 'docs/notes.md',
              status: 'indexed',
            },
          ],
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(listFiles()).resolves.toEqual([
      {
        id: '1',
        name: 'notes.md',
        path: 'docs/notes.md',
        status: 'indexed',
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/files');
  });

  it('throws when listing files fails', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(createResponse({ ok: false, status: 503 }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(listFiles()).rejects.toThrow('Could not load uploaded files. (503)');
  });
});
