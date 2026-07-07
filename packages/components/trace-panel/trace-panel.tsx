import { cn } from '@vyriy/cn';

import { statusLabels } from './status-labels.js';
import type { TracePanelType } from './types.js';

/** Renders visible application-level agent pipeline events. */
export const TracePanel: TracePanelType = ({ events = [], className, ...props }) => {
  return (
    <aside className={cn('trace-panel', className)} {...props}>
      <div className="trace-panel__header">
        <h2 className="trace-panel__title">Application Trace</h2>
        <p className="trace-panel__note">Visible app steps, not hidden model thoughts.</p>
      </div>
      {events.length ? (
        <ol className="trace-panel__list">
          {events.map((event) => (
            <li key={event.id} className={cn('trace-panel__event', `trace-panel__event--${event.status}`)}>
              <div className="trace-panel__event-header">
                <h3 className="trace-panel__event-title">{event.title}</h3>
                <span className="trace-panel__status">{statusLabels[event.status]}</span>
              </div>
              {event.description ? <p className="trace-panel__description">{event.description}</p> : null}
              {event.metadata ? (
                <dl className="trace-panel__metadata">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <div key={key} className="trace-panel__metadata-item">
                      <dt>{key}</dt>
                      <dd>{String(value)}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <p className="trace-panel__empty">Trace events will appear after a question is submitted.</p>
      )}
    </aside>
  );
};
