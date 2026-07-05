# FileUploadPanel

`FileUploadPanel` renders file selection and upload confirmation controls.

## Usage

```tsx
import { FileUploadPanel } from './file-upload-panel.js';

export const Example = () => <FileUploadPanel onUpload={(file) => console.log(file.name)} />;
```

## Props

```ts
export type FileUploadPanelProps = {
  status?: FileUploadStatus;
  error?: string;
  onUpload?: (file: File) => void | Promise<void>;
} & ComponentProps<'section'>;
```

## Notes

The component keeps the selected file locally and does not perform API calls.
