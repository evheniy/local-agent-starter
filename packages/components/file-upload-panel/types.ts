import type { ComponentProps, FC } from 'react';

/** Upload status for the FileUploadPanel component. */
export type FileUploadStatus = 'idle' | 'uploading' | 'success' | 'error';

/** Props for the FileUploadPanel component. */
export type FileUploadPanelProps = {
  status?: FileUploadStatus;
  error?: string;
  onUpload?: (file: File) => void | Promise<void>;
} & ComponentProps<'section'>;

/** FileUploadPanel component type. */
export type FileUploadPanelType = FC<FileUploadPanelProps>;
