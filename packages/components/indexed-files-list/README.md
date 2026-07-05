# IndexedFilesList

`IndexedFilesList` shows files that have been uploaded or indexed.

## Usage

```tsx
import { IndexedFilesList } from './indexed-files-list.js';

export const Example = () => <IndexedFilesList files={[{ id: '1', name: 'notes.md', status: 'indexed' }]} />;
```

## Props

```ts
export type IndexedFilesListProps = {
  files?: IndexedFile[];
} & ComponentProps<'section'>;
```
