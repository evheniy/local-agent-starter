import { cn } from '@vyriy/cn';

import { formatFileSize } from './format-file-size.js';
import { statusLabels } from './status-labels.js';
import type { IndexedFilesListType } from './types.js';

const formatCreatedAt = (createdAt: string | undefined) => {
  if (!createdAt) {
    return undefined;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(createdAt));
};

/** Renders indexed or uploaded files for the local agent app. */
export const IndexedFilesList: IndexedFilesListType = ({
  files = [],
  isRefreshing = false,
  onRefresh,
  className,
  ...props
}) => {
  return (
    <section className={cn('indexed-files-list', className)} {...props}>
      <div className="indexed-files-list__header">
        <div>
          <h2 className="indexed-files-list__title">Documents</h2>
          <p className="indexed-files-list__note">Indexed files are ready for chat.</p>
        </div>
        {onRefresh ? (
          <button
            className="indexed-files-list__refresh"
            type="button"
            disabled={isRefreshing}
            onClick={() => {
              void onRefresh();
            }}
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        ) : null}
      </div>
      {files.length ? (
        <ul className="indexed-files-list__list">
          {files.map((file) => {
            const createdAt = formatCreatedAt(file.createdAt);

            return (
              <li key={file.id} className="indexed-files-list__file">
                <div className="indexed-files-list__file-header">
                  <h3 className="indexed-files-list__file-name">{file.name}</h3>
                  <span className={cn('indexed-files-list__status', `indexed-files-list__status--${file.status}`)}>
                    {statusLabels[file.status]}
                  </span>
                </div>
                {file.path ? <p className="indexed-files-list__path">{file.path}</p> : null}
                <p className="indexed-files-list__meta">
                  {formatFileSize(file.size)}
                  {file.type ? ` · ${file.type}` : ''}
                  {typeof file.chunksCount === 'number' ? ` · ${file.chunksCount} chunks` : ''}
                  {createdAt ? ` · ${createdAt}` : ''}
                </p>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="indexed-files-list__empty">No documents yet. Upload a file to start local RAG.</p>
      )}
    </section>
  );
};
