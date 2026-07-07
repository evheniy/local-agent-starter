import type {
  CreateRagChunkType,
  CreateRagDocumentType,
  DeleteRagDocumentByFileIdType,
  GetUploadedFileByIdType,
  MarkUploadedFileIndexedType,
  UpdateUploadedFileStatusType,
  UploadedFile,
} from '../postgres/index.js';

export type TextChunk = {
  index: number;
  content: string;
  startOffset: number;
  endOffset: number;
};

export type SplitTextOptions = {
  chunkSize?: number;
  overlap?: number;
};

export type ReadUploadedFileTextType = (file: UploadedFile) => Promise<string>;

export type IndexUploadedFileInput = {
  fileId: string;
};

export type IndexUploadedFileOutput = {
  fileId: string;
  documentId: string;
  chunksCount: number;
};

export type IndexUploadedFileDependencies = {
  getUploadedFileById: GetUploadedFileByIdType;
  updateUploadedFileStatus: UpdateUploadedFileStatusType;
  markUploadedFileIndexed: MarkUploadedFileIndexedType;
  deleteRagDocumentByFileId: DeleteRagDocumentByFileIdType;
  createRagDocument: CreateRagDocumentType;
  createRagChunk: CreateRagChunkType;
  createEmbedding: (input: string) => Promise<number[]>;
  readUploadedFileText: ReadUploadedFileTextType;
  splitText: (text: string) => TextChunk[];
};

export type IndexUploadedFileType = (input: IndexUploadedFileInput) => Promise<IndexUploadedFileOutput>;
