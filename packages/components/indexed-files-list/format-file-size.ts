import type { IndexedFilesListFormatFileSizeType } from './types.js';

export const formatFileSize: IndexedFilesListFormatFileSizeType = (size) => {
  if (typeof size !== 'number') {
    return 'Unknown size';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  return `${(size / 1024).toFixed(1)} KB`;
};
