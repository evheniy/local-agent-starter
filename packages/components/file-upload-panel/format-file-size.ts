import type { FileUploadPanelFormatFileSizeType } from './types.js';

export const formatFileSize: FileUploadPanelFormatFileSizeType = (size) => {
  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
};
