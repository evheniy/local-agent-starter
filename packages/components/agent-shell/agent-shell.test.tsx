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

  it('renders the Chat tab by default', () => {
    render(<AgentShell {...props} />);

    expect(screen.getByRole('heading', { name: 'Local Agent Starter' })).toBeDefined();
    expect(screen.getByRole('tabpanel', { name: 'Chat' })).toBeDefined();
    expect(screen.getByText('Application Trace')).toBeDefined();
    expect(screen.getByText('Retrieved Chunks')).toBeDefined();
  });

  it('renders the Upload tab when selected', () => {
    render(<AgentShell {...props} tab="upload" />);

    expect(screen.getByRole('tabpanel', { name: 'Upload' })).toBeDefined();
    expect(screen.getByText('Indexed Files')).toBeDefined();
  });

  it('calls onTabChange when a tab is selected', () => {
    const onTabChange = jest.fn();

    render(<AgentShell {...props} onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }));

    expect(onTabChange).toHaveBeenCalledWith('upload');
  });
});
