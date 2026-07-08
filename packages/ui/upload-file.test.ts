import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { uploadFile } from './upload-file.js';

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

describe('uploadFile', () => {
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

  it('uses fallback content type and throws upload errors', async () => {
    const file = new File(['hello'], 'notes.md');
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ body: { file: { id: '1', name: 'notes.md', status: 'uploaded' } } }))
      .mockResolvedValueOnce(createResponse({ ok: false, status: 409 }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await uploadFile(file);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/upload?filename=notes.md',
      expect.objectContaining({
        headers: {
          'content-type': 'application/octet-stream',
        },
      }),
    );
    await expect(uploadFile(file)).rejects.toThrow('This file is already uploaded.');
  });
});
