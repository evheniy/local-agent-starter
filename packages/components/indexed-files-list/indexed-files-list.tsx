import { cn } from '@vyriy/cn';

import { formatFileSize } from './format-file-size.js';
import { statusLabels } from './status-labels.js';
import type { IndexedFilesListType } from './types.js';

/** Renders indexed or uploaded files for the local agent app. */
export const IndexedFilesList: IndexedFilesListType = ({ files = [], className, ...props }) => {
  return (
    <section className={cn('indexed-files-list', className)} {...props}>
      <div className="indexed-files-list__header">
        <h2 className="indexed-files-list__title">Indexed Files</h2>
        <p className="indexed-files-list__note">Files prepared for retrieval will appear here.</p>
      </div>
      {files.length ? (
        <ul className="indexed-files-list__list">
          {files.map((file) => (
            <li key={file.id} className="indexed-files-list__file">
              <div className="indexed-files-list__file-header">
                <h3 className="indexed-files-list__file-name">{file.name}</h3>
                <span className={cn('indexed-files-list__status', `indexed-files-list__status--${file.status}`)}>
                  {statusLabels[file.status]}
                </span>
              </div>
              <p className="indexed-files-list__meta">
                {formatFileSize(file.size)}
                {file.type ? ` · ${file.type}` : ''}
                {typeof file.chunksCount === 'number' ? ` · ${file.chunksCount} chunks` : ''}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="indexed-files-list__empty">No files have been uploaded yet.</p>
      )}
    </section>
  );
};
