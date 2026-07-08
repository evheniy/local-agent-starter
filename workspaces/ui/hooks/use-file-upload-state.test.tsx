import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { useFileUploadState } from './use-file-upload-state.js';

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

const storedFile = {
  id: 'stored-notes',
  name: 'stored-notes.md',
  path: 'docs/stored-notes.md',
  size: 12,
  type: 'text/markdown',
  status: 'uploaded' as const,
};

const serverFile = {
  id: 'server-notes',
  name: 'notes.md',
  path: 'docs/notes.md',
  size: 5,
  type: 'text/markdown',
  status: 'uploaded' as const,
};

describe('useFileUploadState', () => {
  let previousApi: string | undefined;

  beforeEach(() => {
    jest.useFakeTimers();
    previousApi = process.env.API;
    process.env.API = 'http://localhost:3000';
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'fetch');

    if (previousApi === undefined) {
      delete process.env.API;
    } else {
      process.env.API = previousApi;
    }
  });

  it('loads and refreshes files', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ body: { files: [storedFile] } }))
      .mockResolvedValueOnce(createResponse({ body: { files: [{ ...storedFile, status: 'indexed' }] } }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useFileUploadState());

    await waitFor(() => expect(result.current.files[0]?.id).toBe('stored-notes'));

    await act(async () => {
      await result.current.syncFiles();
    });

    expect(result.current.files[0]?.status).toBe('indexed');
    expect(result.current.isRefreshing).toBe(false);
  });

  it('uploads the selected file and refreshes files', async () => {
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ body: { files: [storedFile] } }))
      .mockResolvedValueOnce(createResponse({ body: { file: serverFile } }))
      .mockResolvedValueOnce(createResponse({ body: { files: [serverFile] } }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useFileUploadState());

    await waitFor(() => expect(result.current.files[0]?.id).toBe('stored-notes'));

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/upload?filename=notes.md',
      expect.objectContaining({
        method: 'POST',
        body: file,
      }),
    );
    expect(result.current.status).toBe('success');
    expect(result.current.file).toBeUndefined();
    expect(result.current.files[0]?.id).toBe('server-notes');
  });

  it('stores friendly upload errors', async () => {
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ body: { files: [storedFile] } }))
      .mockResolvedValueOnce(createResponse({ ok: false, status: 409 }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useFileUploadState());

    await waitFor(() => expect(result.current.files[0]?.id).toBe('stored-notes'));

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('This file is already uploaded.');
    expect(result.current.files).toHaveLength(1);
  });

  it('does not upload without a selected file or while uploading', async () => {
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ body: { files: [storedFile] } }))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(createResponse({ body: { file: serverFile } })), 10);
          }),
      );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useFileUploadState());

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);

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

  it('polls while files are not terminal', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ body: { files: [storedFile] } }))
      .mockResolvedValueOnce(createResponse({ body: { files: [{ ...storedFile, status: 'indexed' }] } }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    renderHook(() => useFileUploadState());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      jest.advanceTimersByTime(2000);
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('stores sync fallback errors', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue('metadata down');

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useFileUploadState());

    await waitFor(() => expect(result.current.error).toBe('Could not load uploaded files.'));
  });
});
