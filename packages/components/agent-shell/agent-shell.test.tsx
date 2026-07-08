import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { AgentShell } from './agent-shell.js';

describe('AgentShell', () => {
  const props = {
    tab: 'chat' as const,
    chatPanel: {
      question: 'What is indexed?',
    },
    uploadPanel: {},
  };

  it('renders the document and chat panels', () => {
    const { container } = render(<AgentShell {...props} />);

    expect(screen.getByRole('heading', { name: 'Local Agent Starter' })).toBeDefined();
    expect(screen.getByRole('tabpanel', { name: 'Chat' })).toBeDefined();
    expect(container.querySelector('#agent-panel-upload')).toBeDefined();
    expect(screen.getByText('Documents')).toBeDefined();
  });

  it('passes file refresh props', () => {
    const onRefresh = jest.fn<() => void>();

    render(
      <AgentShell
        {...props}
        tab="upload"
        filesPanel={{
          onRefresh,
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('renders active upload content, trace events, and retrieved chunks', () => {
    const { container } = render(
      <AgentShell
        {...props}
        tab="upload"
        traceEvents={[
          {
            id: 'trace-1',
            title: 'Retrieve',
            description: 'Found context.',
            status: 'done',
            metadata: {
              chunks: 1,
            },
          },
        ]}
        chunks={[
          {
            id: 'chunk-1',
            title: 'README.md',
            path: 'docs/README.md',
            content: 'Relevant preview.',
            score: 0.82,
          },
        ]}
      />,
    );

    expect(screen.getByRole('tabpanel', { name: 'Upload' }).className).toContain('agent-shell__documents--active');
    expect(container.querySelector('#agent-panel-chat')).toBeDefined();
    expect(screen.getByText('Application Trace')).toBeDefined();
    expect(screen.getByText('Retrieve')).toBeDefined();
    expect(screen.getByText('Retrieved Chunks')).toBeDefined();
    expect(screen.getByText('Relevant preview.')).toBeDefined();
  });

  it('calls onTabChange when a tab is selected', () => {
    const onTabChange = jest.fn();

    render(<AgentShell {...props} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }));

    expect(onTabChange).toHaveBeenCalledWith('upload');
  });
});
