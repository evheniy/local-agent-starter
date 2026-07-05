# RetrievedChunks

`RetrievedChunks` displays source previews selected by RAG/search.

## Usage

```tsx
import { RetrievedChunks } from './retrieved-chunks.js';

export const Example = () => <RetrievedChunks chunks={[{ id: '1', content: 'A chunk preview.' }]} />;
```

## Props

```ts
export type RetrievedChunksProps = {
  chunks?: RetrievedChunk[];
} & ComponentProps<'section'>;
```
