import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { IndexedFilesList } from './indexed-files-list.js';

describe('IndexedFilesList', () => {
  it('renders an empty state', () => {
    render(<IndexedFilesList />);

    expect(screen.getByText('No files have been uploaded yet.')).toBeDefined();
  });

  it('renders indexed files', () => {
    render(
      <IndexedFilesList
        files={[
          {
            id: 'file-1',
            name: 'concepts.md',
            size: 2048,
            type: 'text/markdown',
            status: 'indexed',
            chunksCount: 4,
          },
        ]}
      />,
    );

    expect(screen.getByText('concepts.md')).toBeDefined();
    expect(screen.getByText('Indexed')).toBeDefined();
    expect(screen.getByText('2.0 KB · text/markdown · 4 chunks')).toBeDefined();
  });

  it('renders files with unknown size and minimal metadata', () => {
    render(
      <IndexedFilesList
        files={[
          {
            id: 'file-1',
            name: 'notes.txt',
            size: 12,
            status: 'uploaded',
          },
          {
            id: 'file-2',
            name: 'unknown.bin',
            status: 'error',
          },
        ]}
      />,
    );

    expect(screen.getByText('12 B')).toBeDefined();
    expect(screen.getByText('Unknown size')).toBeDefined();
    expect(screen.getByText('Error')).toBeDefined();
  });
});
