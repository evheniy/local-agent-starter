# FileUploadPanel

`FileUploadPanel` renders file selection and upload confirmation controls.

## Usage

```tsx
import { FileUploadPanel } from './file-upload-panel.js';

export const Example = () => <FileUploadPanel onUpload={() => console.log('upload')} />;
```

## Props

```ts
export type FileUploadPanelProps = {
  file?: File;
  status?: FileUploadStatus;
  error?: string;
  onFileChange?: (file: File | undefined) => void;
  onUpload?: () => void | Promise<void>;
} & ComponentProps<'section'>;
```

## Notes

The component is controlled by props and does not perform API calls.
