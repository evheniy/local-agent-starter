import { cn } from '@vyriy/cn';

import type { RetrievedChunksType } from './types.js';

/** Renders chunks retrieved by the local RAG/search flow. */
export const RetrievedChunks: RetrievedChunksType = ({ chunks = [], className, ...props }) => {
  return (
    <section className={cn('retrieved-chunks', className)} {...props}>
      <div className="retrieved-chunks__header">
        <h2 className="retrieved-chunks__title">Retrieved Chunks</h2>
        <p className="retrieved-chunks__note">Source previews selected by retrieval.</p>
      </div>
      {chunks.length ? (
        <ul className="retrieved-chunks__list">
          {chunks.map((chunk) => (
            <li key={chunk.id} className="retrieved-chunks__chunk">
              <div className="retrieved-chunks__chunk-header">
                <h3 className="retrieved-chunks__chunk-title">{chunk.title ?? chunk.path ?? 'Untitled source'}</h3>
                {typeof chunk.score === 'number' ? (
                  <span className="retrieved-chunks__score">Score {chunk.score.toFixed(2)}</span>
                ) : null}
              </div>
              {chunk.path ? <p className="retrieved-chunks__path">{chunk.path}</p> : null}
              <p className="retrieved-chunks__content">{chunk.content}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="retrieved-chunks__empty">Retrieved chunks will appear here after search runs.</p>
      )}
    </section>
  );
};
