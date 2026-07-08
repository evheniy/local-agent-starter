import type { Dispatch, SetStateAction } from 'react';

import type { AgentShellTab } from '@p/components/agent-shell';
import type { ChatMessage } from '@p/components/chat-panel';
import type { FileUploadStatus } from '@p/components/file-upload-panel';
import type { IndexedFile } from '@p/components/indexed-files-list';

/** State returned by useAgentShellTab. */
export type UseAgentShellTabResult = {
  tab: AgentShellTab;
  setTab: Dispatch<SetStateAction<AgentShellTab>>;
};

/** Keeps the selected AgentShell tab. */
export type UseAgentShellTabType = (initialTab?: AgentShellTab) => UseAgentShellTabResult;

/** State returned by useChatPanelState. */
export type UseChatPanelStateResult = {
  answer: string;
  canSubmit: boolean;
  error: string | undefined;
  hasIndexedFiles: boolean;
  isLoading: boolean;
  messages: ChatMessage[];
  onQuestionChange: Dispatch<SetStateAction<string>>;
  onSubmit: () => Promise<void>;
  question: string;
};

/** Keeps local chat panel state. */
export type UseChatPanelStateType = (options?: { files?: IndexedFile[] }) => UseChatPanelStateResult;

/** State returned by useFileUploadState. */
export type UseFileUploadStateResult = {
  error: string | undefined;
  file: File | undefined;
  files: IndexedFile[];
  isRefreshing: boolean;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  status: FileUploadStatus;
  syncFiles: () => Promise<void>;
  uploadFile: () => Promise<void>;
};

/** Keeps local file upload state. */
export type UseFileUploadStateType = () => UseFileUploadStateResult;
