export type UploadedFile = {
  id: string;
  name: string;
  path?: string;
  size?: number;
  type?: string;
  status: 'uploaded' | 'indexing' | 'indexed' | 'error';
  chunksCount?: number;
  error?: string;
};

export type FilesResponse = {
  files: UploadedFile[];
};

export type UploadFileResponse = {
  file: UploadedFile;
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

export type StreamChatRequest = Required<Pick<StreamChatInput, 'handlers' | 'message'>> &
  Pick<StreamChatInput, 'limit' | 'signal'>;

export type StreamEvent = {
  event: string;
  data: unknown;
};
