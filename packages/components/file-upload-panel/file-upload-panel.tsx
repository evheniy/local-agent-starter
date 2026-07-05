import { useState } from 'react';
import { cn } from '@vyriy/cn';

import type { FileUploadPanelType } from './types.js';

const statusLabels = {
  idle: 'Select a file to upload.',
  uploading: 'Uploading file...',
  success: 'File uploaded successfully.',
  error: 'Upload failed.',
};

const formatFileSize = (size: number) => {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
};

/** Renders a local file picker ready for future ingest API wiring. */
export const FileUploadPanel: FileUploadPanelType = ({ status = 'idle', error, onUpload, className, ...props }) => {
  const [file, setFile] = useState<File>();

  return (
    <section className={cn('file-upload-panel', className)} {...props}>
      <div className="file-upload-panel__field">
        <label className="file-upload-panel__label" htmlFor="agent-file">
          File
        </label>
        <input
          id="agent-file"
          className="file-upload-panel__input"
          type="file"
          onChange={(event) => setFile(event.target.files?.[0])}
        />
      </div>
      {file ? (
        <dl className="file-upload-panel__info">
          <div className="file-upload-panel__info-item">
            <dt>Name</dt>
            <dd>{file.name}</dd>
          </div>
          <div className="file-upload-panel__info-item">
            <dt>Size</dt>
            <dd>{formatFileSize(file.size)}</dd>
          </div>
          <div className="file-upload-panel__info-item">
            <dt>Type</dt>
            <dd>{file.type || 'Unknown type'}</dd>
          </div>
        </dl>
      ) : (
        <p className="file-upload-panel__empty">No file selected.</p>
      )}
      <button
        className="file-upload-panel__button"
        type="button"
        disabled={!file || status === 'uploading'}
        onClick={() => {
          if (file) {
            void onUpload?.(file);
          }
        }}
      >
        {status === 'uploading' ? 'Uploading...' : 'Upload'}
      </button>
      <p className={cn('file-upload-panel__status', `file-upload-panel__status--${status}`)}>
        {error && status === 'error' ? error : statusLabels[status]}
      </p>
    </section>
  );
};
