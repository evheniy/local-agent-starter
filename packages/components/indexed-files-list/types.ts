import type { ComponentProps, FC } from 'react';

/** Status for an indexed file. */
export type IndexedFileStatus = 'uploaded' | 'indexing' | 'indexed' | 'error';

/** File shown by the IndexedFilesList component. */
export type IndexedFile = {
  id: string;
  name: string;
  size?: number;
  type?: string;
  status: IndexedFileStatus;
  chunksCount?: number;
};

/** Props for the IndexedFilesList component. */
export type IndexedFilesListProps = {
  files?: IndexedFile[];
} & ComponentProps<'section'>;

/** IndexedFilesList component type. */
export type IndexedFilesListType = FC<IndexedFilesListProps>;
