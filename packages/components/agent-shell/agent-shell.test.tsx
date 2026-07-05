import { describe, it, expect } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { AgentShell } from './agent-shell.js';

describe('AgentShell', () => {
  it('renders the Chat tab by default', () => {
    render(<AgentShell />);

    expect(screen.getByRole('heading', { name: 'Local Agent Starter' })).toBeDefined();
    expect(screen.getByRole('tabpanel', { name: 'Chat' })).toBeDefined();
    expect(screen.getByText('Application Trace')).toBeDefined();
    expect(screen.getByText('Retrieved Chunks')).toBeDefined();
  });

  it('renders the Upload tab when selected', () => {
    render(<AgentShell />);
    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }));

    expect(screen.getByRole('tabpanel', { name: 'Upload' })).toBeDefined();
    expect(screen.getByText('Indexed Files')).toBeDefined();
  });
});
