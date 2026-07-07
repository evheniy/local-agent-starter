import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { useFileUploadState } from './use-file-upload-state.js';

const createResponse = ({
  body = '',
  ok = true,
  status = 200,
}: {
  body?: unknown;
  ok?: boolean;
  status?: number;
} = {}) =>
  ({
    headers: {
      get: () => (body ? 'application/json' : null),
    },
    json: () => Promise.resolve(body),
    ok,
    status,
    statusText: '',
    text: () => Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)),
    type: 'basic',
    url: '',
  }) as unknown as Response;

const createFilesResponse = () =>
  createResponse({
    body: {
      files: [
        {
          id: 'stored-notes',
          name: 'stored-notes.md',
          path: 'docs/stored-notes.md',
          size: 12,
          type: 'text/markdown',
          status: 'uploaded',
        },
      ],
    },
  });

const createUploadResponse = () =>
  createResponse({
    body: {
      file: {
        id: 'server-notes',
        name: 'notes.md',
        path: 'docs/notes.md',
        size: 5,
        type: 'text/markdown',
        status: 'uploaded',
      },
    },
  });

describe('useFileUploadState', () => {
  let previousApi: string | undefined;

  beforeEach(() => {
    previousApi = process.env.API;
    process.env.API = 'http://localhost:3000';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'fetch');

    if (typeof previousApi === 'string') {
      process.env.API = previousApi;

      return;
    }

    delete process.env.API;
  });

  it('uploads the selected file and records it as uploaded', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createFilesResponse())
      .mockResolvedValueOnce(createUploadResponse());
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await waitFor(() => expect(result.current.files[0]?.id).toBe('stored-notes'));

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/files', expect.any(Object));
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/upload?filename=notes.md',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'text/markdown',
        },
        body: file,
      }),
    );
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.files[0]).toMatchObject({
      id: 'server-notes',
      name: 'notes.md',
      size: 5,
      type: 'text/markdown',
      status: 'uploaded',
    });
  });

  it('stores an error when upload fails', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createFilesResponse())
      .mockResolvedValueOnce(createResponse({ ok: false, status: 500 }));
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await waitFor(() => expect(result.current.files[0]?.id).toBe('stored-notes'));

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Request failed with status 500');
    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0]?.id).toBe('stored-notes');
  });

  it('uses default content type and fallback error text', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createFilesResponse())
      .mockRejectedValueOnce('network down');
    const file = new File(['hello'], 'notes.bin');
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await waitFor(() => expect(result.current.files[0]?.id).toBe('stored-notes'));

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/upload?filename=notes.bin',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'content-type': 'application/octet-stream',
        },
        body: file,
      }),
    );
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Upload failed.');
  });

  it('does not upload without a selected file', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(createFilesResponse());
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/files', expect.any(Object));
    expect(result.current.status).toBe('idle');
  });

  it('does not start another upload while uploading', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createFilesResponse())
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(createUploadResponse()), 10);
          }),
      );
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await waitFor(() => expect(result.current.files[0]?.id).toBe('stored-notes'));

    act(() => {
      result.current.setFile(file);
    });
    void act(() => {
      void result.current.uploadFile();
    });

    await waitFor(() => expect(result.current.status).toBe('uploading'));

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stores an error when file metadata sync fails', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue(new Error('metadata down'));
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await waitFor(() => expect(result.current.error).toBe('metadata down'));
  });

  it('stores fallback error text when file metadata sync fails without an error object', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue('metadata down');
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await waitFor(() => expect(result.current.error).toBe('Could not load uploaded files.'));
  });
});
