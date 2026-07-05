import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { TracePanel } from './trace-panel.js';

describe('TracePanel', () => {
  it('renders trace events', () => {
    render(
      <TracePanel
        events={[
          {
            id: 'retrieve',
            title: 'Retrieve context',
            description: 'Search indexed chunks.',
            status: 'running',
            metadata: { chunks: 3 },
          },
        ]}
      />,
    );

    expect(screen.getByText('Retrieve context')).toBeDefined();
    expect(screen.getByText('Search indexed chunks.')).toBeDefined();
    expect(screen.getByText('Running')).toBeDefined();
    expect(screen.getByText('chunks')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
  });

  it('renders an empty state', () => {
    render(<TracePanel />);

    expect(screen.getByText('Trace events will appear after a question is submitted.')).toBeDefined();
  });

  it('renders events without optional details', () => {
    render(
      <TracePanel
        events={[
          {
            id: 'answer',
            title: 'Generate response',
            status: 'pending',
          },
        ]}
      />,
    );

    expect(screen.getByText('Generate response')).toBeDefined();
    expect(screen.getByText('Pending')).toBeDefined();
  });
});
