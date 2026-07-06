import { cn } from '@vyriy/cn';

import { AgentTabs } from '../agent-tabs/index.js';
import { ChatPanel } from '../chat-panel/index.js';
import { FileUploadPanel } from '../file-upload-panel/index.js';
import { IndexedFilesList } from '../indexed-files-list/index.js';
import { RetrievedChunks } from '../retrieved-chunks/index.js';
import { TracePanel } from '../trace-panel/index.js';
import type { AgentShellType } from './types.js';

/** Renders the main local agent app shell with chat and upload modes. */
export const AgentShell: AgentShellType = ({
  tab,
  chatPanel,
  chunks = [],
  files = [],
  traceEvents = [],
  uploadPanel,
  onTabChange,
  className,
  ...props
}) => {
  return (
    <section className={cn('agent-shell', className)} {...props}>
      <header className="agent-shell__header">
        <div>
          <h1 className="agent-shell__title">Local Agent Starter</h1>
          <p className="agent-shell__subtitle">Chat with local context and prepare files for indexing.</p>
        </div>
        <AgentTabs value={tab} onValueChange={onTabChange} />
      </header>
      {tab === 'chat' ? (
        <div className="agent-shell__grid" role="tabpanel" aria-label="Chat">
          <ChatPanel {...chatPanel} />
          <TracePanel events={traceEvents} />
          <RetrievedChunks chunks={chunks} />
        </div>
      ) : (
        <div className="agent-shell__grid" role="tabpanel" aria-label="Upload">
          <FileUploadPanel {...uploadPanel} />
          <IndexedFilesList files={files} />
        </div>
      )}
    </section>
  );
};
