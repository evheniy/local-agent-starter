import type { ComponentProps, FC } from 'react';
import type { ChatPanelProps } from '../chat-panel/index.js';
import type { FileUploadPanelProps } from '../file-upload-panel/index.js';
import type { IndexedFile, IndexedFilesListProps } from '../indexed-files-list/index.js';
import type { RetrievedChunk } from '../retrieved-chunks/index.js';
import type { TraceEvent } from '../trace-panel/index.js';

/** Tab value for the AgentShell component. */
export type AgentShellTab = 'chat' | 'upload';

/** Props for the AgentShell component. */
export type AgentShellProps = {
  tab: AgentShellTab;
  chatPanel: ChatPanelProps;
  uploadPanel: FileUploadPanelProps;
  filesPanel?: Pick<IndexedFilesListProps, 'isRefreshing' | 'onRefresh'>;
  chunks?: RetrievedChunk[];
  files?: IndexedFile[];
  traceEvents?: TraceEvent[];
  onTabChange?: (tab: AgentShellTab) => void;
} & ComponentProps<'section'>;

/** AgentShell component type. */
export type AgentShellType = FC<AgentShellProps>;
