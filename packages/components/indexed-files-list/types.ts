import type { ComponentProps, FC } from 'react';

/** Status for an indexed file. */
export type IndexedFileStatus = 'uploaded' | 'indexing' | 'indexed' | 'error';

/** File shown by the IndexedFilesList component. */
export type IndexedFile = {
  id: string;
  name: string;
  path?: string;
  size?: number;
  type?: string;
  status: IndexedFileStatus;
  chunksCount?: number;
  createdAt?: string;
};

/** Props for the IndexedFilesList component. */
export type IndexedFilesListProps = {
  files?: IndexedFile[];
  isRefreshing?: boolean;
  onRefresh?: () => void | Promise<void>;
} & ComponentProps<'section'>;

/** IndexedFilesList component type. */
export type IndexedFilesListType = FC<IndexedFilesListProps>;

/** Formats an indexed file size for display. */
export type IndexedFilesListFormatFileSizeType = (size?: number) => string;

/** Display labels for every indexed file status. */
export type IndexedFilesListStatusLabelsType = Record<IndexedFileStatus, string>;
