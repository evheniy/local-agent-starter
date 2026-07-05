import type { ComponentProps, FC } from 'react';

/** Retrieved document chunk shown by the RetrievedChunks component. */
export type RetrievedChunk = {
  id: string;
  title?: string;
  path?: string;
  content: string;
  score?: number;
};

/** Props for the RetrievedChunks component. */
export type RetrievedChunksProps = {
  chunks?: RetrievedChunk[];
} & ComponentProps<'section'>;

/** RetrievedChunks component type. */
export type RetrievedChunksType = FC<RetrievedChunksProps>;
