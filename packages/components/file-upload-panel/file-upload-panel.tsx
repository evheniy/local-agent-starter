import { cn } from '@vyriy/cn';

import { formatFileSize } from './format-file-size.js';
import { statusLabels } from './status-labels.js';
import type { FileUploadPanelType } from './types.js';

const ACCEPTED_DOCUMENT_TYPES = '.txt,.md,.mdx,.json,.ts,.tsx,.js,.jsx,.css,.scss,.html,.xml,.yml,.yaml,.csv';

/** Renders a local file picker ready for future ingest API wiring. */
export const FileUploadPanel: FileUploadPanelType = ({
  file,
  status = 'idle',
  error,
  onFileChange,
  onUpload,
  className,
  ...props
}) => {
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
          accept={ACCEPTED_DOCUMENT_TYPES}
          onChange={(event) => onFileChange?.(event.target.files?.[0])}
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
            void onUpload?.();
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
