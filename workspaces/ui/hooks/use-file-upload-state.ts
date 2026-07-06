import { useState } from 'react';

import type { FileUploadStatus } from '@p/components/file-upload-panel';
import type { IndexedFile } from '@p/components/indexed-files-list';

export const useFileUploadState = () => {
  const [error, setError] = useState<string>();
  const [file, setFile] = useState<File>();
  const [files, setFiles] = useState<IndexedFile[]>([]);
  const [status, setStatus] = useState<FileUploadStatus>('idle');

  const uploadFile = async () => {
    if (!file || status === 'uploading') {
      return;
    }

    setError(undefined);
    setStatus('uploading');

    try {
      const response = await fetch(`/upload?filename=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'content-type': file.type || 'application/octet-stream',
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}.`);
      }

      setFiles((items) => [
        {
          id: `${file.name}-${file.size}-${file.lastModified}`,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'uploaded',
        },
        ...items,
      ]);
      setStatus('success');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Upload failed.');
      setStatus('error');
    }
  };

  return {
    error,
    file,
    files,
    setFile,
    status,
    uploadFile,
  };
};
