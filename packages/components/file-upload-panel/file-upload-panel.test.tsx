import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { FileUploadPanel } from './file-upload-panel.js';

describe('FileUploadPanel', () => {
  it('shows selected file info', () => {
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });

    render(<FileUploadPanel />);
    fireEvent.change(screen.getByLabelText('File'), { target: { files: [file] } });

    expect(screen.getByText('notes.md')).toBeDefined();
    expect(screen.getByText('5 B')).toBeDefined();
    expect(screen.getByText('text/markdown')).toBeDefined();
  });

  it('calls onUpload with the selected file', () => {
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });
    const onUpload = jest.fn<(file: File) => void>();

    render(<FileUploadPanel onUpload={onUpload} />);
    fireEvent.change(screen.getByLabelText('File'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(onUpload).toHaveBeenCalledWith(file);
  });

  it('renders large files and unknown file types', () => {
    const file = new File(['a'.repeat(2048)], 'notes.bin');

    render(<FileUploadPanel />);
    fireEvent.change(screen.getByLabelText('File'), { target: { files: [file] } });

    expect(screen.getByText('2.0 KB')).toBeDefined();
    expect(screen.getByText('Unknown type')).toBeDefined();
  });

  it('allows selecting a file without an upload handler', () => {
    const file = new File(['hello'], 'notes.md', { type: 'text/markdown' });

    render(<FileUploadPanel />);
    fireEvent.change(screen.getByLabelText('File'), { target: { files: [file] } });
    fireEvent.click(screen.getByRole('button', { name: 'Upload' }));

    expect(screen.getByText('notes.md')).toBeDefined();
  });

  it('renders upload status and error', () => {
    render(<FileUploadPanel status="error" error="Upload failed with a network error." />);

    expect(screen.getByText('Upload failed with a network error.')).toBeDefined();
  });

  it('renders non-error statuses', () => {
    const { rerender } = render(<FileUploadPanel status="success" />);

    expect(screen.getByText('File uploaded successfully.')).toBeDefined();

    rerender(<FileUploadPanel status="uploading" />);

    expect(screen.getByText('Uploading...')).toBeDefined();
  });
});
