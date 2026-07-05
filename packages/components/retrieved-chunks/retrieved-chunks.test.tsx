import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { RetrievedChunks } from './retrieved-chunks.js';

describe('RetrievedChunks', () => {
  it('renders an empty state', () => {
    render(<RetrievedChunks />);

    expect(screen.getByText('Retrieved chunks will appear here after search runs.')).toBeDefined();
  });

  it('renders retrieved chunks', () => {
    render(
      <RetrievedChunks
        chunks={[
          {
            id: 'chunk-1',
            title: 'Project Notes',
            path: 'docs/concepts.md',
            content: 'RAG retrieves context before generation.',
            score: 0.91,
          },
        ]}
      />,
    );

    expect(screen.getByText('Project Notes')).toBeDefined();
    expect(screen.getByText('docs/concepts.md')).toBeDefined();
    expect(screen.getByText('RAG retrieves context before generation.')).toBeDefined();
    expect(screen.getByText('Score 0.91')).toBeDefined();
  });

  it('renders chunks with fallback titles and optional fields omitted', () => {
    render(
      <RetrievedChunks
        chunks={[
          {
            id: 'chunk-path',
            path: 'docs/architecture.md',
            content: 'Architecture notes.',
          },
          {
            id: 'chunk-untitled',
            content: 'Untitled notes.',
          },
        ]}
      />,
    );

    expect(screen.getAllByText('docs/architecture.md')).toHaveLength(2);
    expect(screen.getByText('Untitled source')).toBeDefined();
    expect(screen.getByText('Untitled notes.')).toBeDefined();
  });
});
