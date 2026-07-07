import { useEffect, useState } from 'react';
import { request } from '@vyriy/request';

import type { UseFileUploadStateResult, UseFileUploadStateType } from './types.js';

export const useFileUploadState: UseFileUploadStateType = () => {
  const [error, setError] = useState<UseFileUploadStateResult['error']>();
  const [file, setFile] = useState<UseFileUploadStateResult['file']>();
  const [files, setFiles] = useState<UseFileUploadStateResult['files']>([]);
  const [status, setStatus] = useState<UseFileUploadStateResult['status']>('idle');

  const syncFiles = async () => {
    try {
      const filesUrl = new URL('/files', process.env.API);
      const response = await request<{ files: UseFileUploadStateResult['files'] }>(filesUrl.toString());

      setFiles(response.files);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : 'Could not load uploaded files.');
    }
  };

  const uploadFile = async () => {
    if (!file || status === 'uploading') {
      return;
    }

    setError(undefined);
    setStatus('uploading');

    const optimisticFile = {
      id: `optimistic-${file.name}-${file.size}-${file.lastModified}`,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded' as const,
    };

    setFiles((items) => [optimisticFile, ...items]);

    try {
      const uploadUrl = new URL('/upload', process.env.API);

      uploadUrl.searchParams.set('filename', file.name);

      const response = await request<{ file: UseFileUploadStateResult['files'][number] }>(uploadUrl.toString(), {
        method: 'POST',
        headers: {
          'content-type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      setFiles((items) => items.map((item) => (item.id === optimisticFile.id ? response.file : item)));
      setStatus('success');
    } catch (uploadError) {
      setFiles((items) => items.filter((item) => item.id !== optimisticFile.id));
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
      setStatus('error');
    }
  };

  useEffect(() => {
    void Promise.resolve().then(syncFiles);
  }, []);

  return {
    error,
    file,
    files,
    setFile,
    status,
    syncFiles,
    uploadFile,
  };
};
