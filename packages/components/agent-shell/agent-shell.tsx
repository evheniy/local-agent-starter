import { useState } from 'react';
import { cn } from '@vyriy/cn';

import { AgentTabs } from '../agent-tabs/index.js';
import { ChatPanel } from '../chat-panel/index.js';
import { FileUploadPanel } from '../file-upload-panel/index.js';
import { IndexedFilesList } from '../indexed-files-list/index.js';
import { RetrievedChunks } from '../retrieved-chunks/index.js';
import { TracePanel } from '../trace-panel/index.js';
import type { AgentShellType, AgentShellTab } from './types.js';

const traceEvents = [
  {
    id: 'question',
    title: 'Question received',
    description: 'The UI captured the current user question.',
    status: 'done' as const,
  },
  {
    id: 'retrieval',
    title: 'Retrieve context',
    description: 'Search will later retrieve chunks from indexed files.',
    status: 'running' as const,
    metadata: { provider: 'pgvector', chunks: 2 },
  },
  {
    id: 'answer',
    title: 'Generate response',
    description: 'The answer stream placeholder waits for API wiring.',
    status: 'pending' as const,
  },
];

const chunks = [
  {
    id: 'chunk-1',
    title: 'Project Concepts',
    path: 'docs/concepts.md',
    content: 'RAG retrieves project or document context before asking an LLM to answer.',
    score: 0.91,
  },
  {
    id: 'chunk-2',
    title: 'pgvector Notes',
    path: 'docs/pgvector.md',
    content: 'The embedding dimension must stay aligned with the embedding model.',
    score: 0.84,
  },
];

const files = [
  {
    id: 'file-1',
    name: 'concepts.md',
    size: 2048,
    type: 'text/markdown',
    status: 'indexed' as const,
    chunksCount: 6,
  },
  {
    id: 'file-2',
    name: 'architecture.md',
    size: 1536,
    type: 'text/markdown',
    status: 'uploaded' as const,
  },
];

/** Renders the main local agent app shell with chat and upload modes. */
export const AgentShell: AgentShellType = ({ defaultTab = 'chat', className, ...props }) => {
  const [tab, setTab] = useState<AgentShellTab>(defaultTab);

  return (
    <section className={cn('agent-shell', className)} {...props}>
      <header className="agent-shell__header">
        <div>
          <h1 className="agent-shell__title">Local Agent Starter</h1>
          <p className="agent-shell__subtitle">Chat with local context and prepare files for indexing.</p>
        </div>
        <AgentTabs value={tab} onValueChange={setTab} />
      </header>
      {tab === 'chat' ? (
        <div className="agent-shell__grid" role="tabpanel" aria-label="Chat">
          <ChatPanel
            defaultQuestion="What does this project already know about pgvector?"
            answer="This placeholder answer will later be streamed from the local agent API."
          />
          <TracePanel events={traceEvents} />
          <RetrievedChunks chunks={chunks} />
        </div>
      ) : (
        <div className="agent-shell__grid" role="tabpanel" aria-label="Upload">
          <FileUploadPanel />
          <IndexedFilesList files={files} />
        </div>
      )}
    </section>
  );
};
