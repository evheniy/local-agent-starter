import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { listFiles, uploadFile } from './files.js';

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

describe('files API helpers', () => {
  let previousApi: string | undefined;

  beforeEach(() => {
    previousApi = process.env.API;
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

  it('uses the browser origin when no API base URL is configured', async () => {
    delete process.env.API;
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: {
          files: [],
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await listFiles();

    expect(fetchMock).toHaveBeenCalledWith('http://localhost/files');
  });

  it('uploads a raw file body', async () => {
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: {
          file: {
            id: '1',
            name: 'notes.md',
            status: 'uploaded',
          },
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(uploadFile(file)).resolves.toEqual({
      id: '1',
      name: 'notes.md',
      status: 'uploaded',
    });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/upload?filename=notes.md', {
      method: 'POST',
      headers: {
        'content-type': 'text/markdown',
      },
      body: file,
    });
  });

  it('returns friendly duplicate upload errors', async () => {
    const file = new File(['hello'], 'notes.md');
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(createResponse({ ok: false, status: 409 }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(uploadFile(file)).rejects.toThrow('This file is already uploaded.');
  });

  it('uses response messages for upload failures', async () => {
    const file = new File(['hello'], 'notes.md');
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        ok: false,
        status: 500,
        body: {
          message: 'Storage offline.',
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(uploadFile(file)).rejects.toThrow('Storage offline.');
  });

  it('falls back when upload failure bodies cannot be parsed', async () => {
    const file = new File(['hello'], 'notes.md');
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      json: jest.fn(() => Promise.reject(new Error('invalid json'))),
      ok: false,
      status: 500,
    } as unknown as Response);

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(uploadFile(file)).rejects.toThrow('Upload failed with status 500');
  });
});
