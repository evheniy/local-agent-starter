import type { IndexedFile } from '@p/components/indexed-files-list';

export type FilesResponse = {
  files: IndexedFile[];
};

export type UploadFileResponse = {
  file: IndexedFile;
};

export type ChatStreamSource = {
  documentTitle?: string;
  path?: string;
  chunkIndex?: number;
  score?: number;
  contentPreview?: string;
};

export type ChatStreamHandlers = {
  onSources?: (sources: ChatStreamSource[]) => void;
  onDelta?: (text: string) => void;
  onDone?: () => void;
  onError?: (error: string) => void;
};

export type StreamChatInput = {
  message: string;
  limit?: number;
  handlers: ChatStreamHandlers;
  signal?: AbortSignal;
};
