import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { IndexedFilesList } from './indexed-files-list.js';

describe('IndexedFilesList', () => {
  it('renders an empty state', () => {
    render(<IndexedFilesList />);

    expect(screen.getByText('No documents yet. Upload a file to start local RAG.')).toBeDefined();
  });

  it('renders indexed files and refreshes them', () => {
    const onRefresh = jest.fn<() => void>();

    render(
      <IndexedFilesList
        onRefresh={onRefresh}
        files={[
          {
            id: 'file-1',
            name: 'concepts.md',
            path: 'docs/concepts.md',
            size: 2048,
            type: 'text/markdown',
            status: 'indexed',
            chunksCount: 4,
            createdAt: '2026-07-07T10:00:00.000Z',
          },
        ]}
      />,
    );

    expect(screen.getByText('concepts.md')).toBeDefined();
    expect(screen.getByText('docs/concepts.md')).toBeDefined();
    expect(screen.getByText('Ready')).toBeDefined();
    expect(screen.getByText(/2.0 KB · text\/markdown · 4 chunks/u)).toBeDefined();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
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

  it('renders indexing and refreshing states', () => {
    render(
      <IndexedFilesList
        isRefreshing
        onRefresh={jest.fn<() => void>()}
        files={[
          {
            id: 'file-1',
            name: 'notes.txt',
            status: 'indexing',
          },
        ]}
      />,
    );

    expect(screen.getByText('Indexing...')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Refreshing...' })).toHaveProperty('disabled', true);
  });
});
