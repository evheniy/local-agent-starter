import type { ComponentProps, FC } from 'react';

/** Upload status for the FileUploadPanel component. */
export type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/** Props for the FileUploadPanel component. */
export type FileUploadPanelProps = {
  file?: File;
  status?: FileUploadStatus;
  error?: string;
  onFileChange?: (file: File | undefined) => void;
  onUpload?: () => void | Promise<void>;
} & ComponentProps<'section'>;

/** FileUploadPanel component type. */
export type FileUploadPanelType = FC<FileUploadPanelProps>;
