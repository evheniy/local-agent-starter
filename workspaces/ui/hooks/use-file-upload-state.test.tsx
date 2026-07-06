import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { useFileUploadState } from './use-file-upload-state.js';

describe('useFileUploadState', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'fetch');
  });

  it('uploads the selected file and records it as uploaded', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      ok: true,
    } as Response);
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledWith('/upload?filename=notes.md', {
      method: 'POST',
      headers: {
        'content-type': 'text/markdown',
      },
      body: file,
    });
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current.files[0]).toMatchObject({
      name: 'notes.md',
      size: 5,
      type: 'text/markdown',
      status: 'uploaded',
    });
  });

  it('stores an error when upload fails', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Upload failed with status 500.');
  });

  it('uses default content type and fallback error text', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue('network down');
    const file = new File(['hello'], 'notes.bin');
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    act(() => {
      result.current.setFile(file);
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).toHaveBeenCalledWith('/upload?filename=notes.bin', {
      method: 'POST',
      headers: {
        'content-type': 'application/octet-stream',
      },
      body: file,
    });
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Upload failed.');
  });

  it('does not upload without a selected file', async () => {
    const fetchMock = jest.fn<typeof fetch>();
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await act(async () => {
      await result.current.uploadFile();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });

  it('does not start another upload while uploading', async () => {
    const fetchMock = jest.fn<typeof fetch>(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true } as Response), 10);
        }),
    );
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const { result } = renderHook(() => useFileUploadState());

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

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

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
