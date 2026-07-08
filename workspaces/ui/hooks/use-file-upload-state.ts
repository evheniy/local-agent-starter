import { useEffect, useState } from 'react';

import { listFiles, uploadFile as uploadSelectedFile } from '@p/ui';
import type { UseFileUploadStateResult, UseFileUploadStateType } from './types.js';

const POLL_INTERVAL_MS = 2000;

const shouldPollFiles = (files: UseFileUploadStateResult['files']) =>
  files.some((file) => file.status === 'uploaded' || file.status === 'indexing');

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export const useFileUploadState: UseFileUploadStateType = () => {
  const [error, setError] = useState<UseFileUploadStateResult['error']>();
  const [file, setFile] = useState<UseFileUploadStateResult['file']>();
  const [files, setFiles] = useState<UseFileUploadStateResult['files']>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<UseFileUploadStateResult['status']>('idle');

  const syncFiles = async () => {
    setIsRefreshing(true);

    try {
      setFiles(await listFiles());
    } catch (syncError) {
      setError(getErrorMessage(syncError, 'Could not load uploaded files.'));
    } finally {
      setIsRefreshing(false);
    }
  };

  const uploadFile = async () => {
    if (!file || status === 'uploading') {
      return;
    }

    setError(undefined);
    setStatus('uploading');

    const optimisticFile: UseFileUploadStateResult['files'][number] = {
      id: `optimistic-${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded' as const,
    };

    setFiles((items) => [optimisticFile, ...items]);

    try {
      const uploadedFile = await uploadSelectedFile(file);

      setFiles((items) => items.map((item) => (item.id === optimisticFile.id ? uploadedFile : item)));
      setStatus('success');
      setFile(undefined);
      await syncFiles();
    } catch (uploadError) {
      setFiles((items) => items.filter((item) => item.id !== optimisticFile.id));
      setError(getErrorMessage(uploadError, 'Upload failed.'));
      setStatus('error');
    }
  };

  useEffect(() => {
    void Promise.resolve().then(syncFiles);
  }, []);

  useEffect(() => {
    if (!shouldPollFiles(files)) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      void syncFiles();
    }, POLL_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [files]);

  return {
    error,
    file,
    files,
    isRefreshing,
    setFile,
    status,
    syncFiles,
    uploadFile,
  };
};
