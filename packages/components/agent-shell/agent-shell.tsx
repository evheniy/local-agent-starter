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
  filesPanel,
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
          <p className="agent-shell__subtitle">Upload local documents and ask grounded questions over indexed files.</p>
        </div>
        <AgentTabs value={tab} onValueChange={onTabChange} />
      </header>
      <div className="agent-shell__layout">
        <aside
          id="agent-panel-upload"
          className={cn('agent-shell__documents', tab === 'upload' && 'agent-shell__documents--active')}
          role="tabpanel"
          aria-labelledby="agent-tab-upload"
          aria-label="Upload"
          hidden={tab !== 'upload'}
        >
          <FileUploadPanel {...uploadPanel} />
          <IndexedFilesList files={files} {...filesPanel} />
        </aside>
        <main
          id="agent-panel-chat"
          className={cn('agent-shell__chat', tab === 'chat' && 'agent-shell__chat--active')}
          role="tabpanel"
          aria-labelledby="agent-tab-chat"
          hidden={tab !== 'chat'}
        >
          <ChatPanel {...chatPanel} />
          {traceEvents.length ? <TracePanel events={traceEvents} /> : null}
          {chunks.length ? <RetrievedChunks chunks={chunks} /> : null}
        </main>
      </div>
    </section>
  );
};
