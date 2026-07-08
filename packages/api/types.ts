import type { IndexUploadedFileType, RagChatType } from '@p/services';
import type { CreateUploadedFileTargetType, SaveUploadedFileType } from '@p/services/fs';
import type {
  CreateUploadedFileType,
  EnqueueRagIndexJobType,
  GetUploadedFileByPathType,
  ListUploadedFilesType,
} from '@p/services/postgres';

export type CreateChatHandlerOptions = {
  ragChat?: RagChatType;
};

export type ChatRequestBody = {
  message?: unknown;
  limit?: unknown;
};

export type ListUploadedFiles = ListUploadedFilesType;

export type CreateIndexFileHandlerOptions = {
  indexUploadedFile?: IndexUploadedFileType;
};

export type CreateUploadHandlerOptions = {
  createUploadedFile?: CreateUploadedFileType;
  enqueueRagIndexJob?: EnqueueRagIndexJobType;
  saveUploadedFile?: SaveUploadedFileType;
  getUploadedFileByPath?: GetUploadedFileByPathType;
  createUploadedFileTarget?: CreateUploadedFileTargetType;
};
