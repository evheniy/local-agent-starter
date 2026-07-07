/** File content storage metadata returned after a successful upload. */
export type SavedUploadedFile = {
  filename: string;
  path: string;
  bytes: number;
  docsDir: string;
  filePath: string;
};

/** File content storage target resolved before writing content. */
export type UploadedFileTarget = Omit<SavedUploadedFile, 'bytes'>;

/** Creates a storage target for an uploaded file. */
export type CreateUploadedFileTargetType = (filename?: string) => UploadedFileTarget;

/** Input used when saving uploaded file content. */
export type SaveUploadedFileInput = {
  content: Buffer;
  filename?: string;
  target?: UploadedFileTarget;
};

/** Saves uploaded file content into storage. */
export type SaveUploadedFileType = (input: SaveUploadedFileInput) => Promise<SavedUploadedFile>;
