import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { AgentTabs } from './agent-tabs.js';

describe('AgentTabs', () => {
  it('renders the active tab', () => {
    render(<AgentTabs value="chat" />);

    expect(screen.getByRole('tab', { name: 'Chat' }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('tab', { name: 'Upload' }).getAttribute('aria-selected')).toBe('false');
  });

  it('calls onValueChange when another tab is selected', () => {
    const onValueChange = jest.fn();

    render(<AgentTabs value="chat" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Upload' }));

    expect(onValueChange).toHaveBeenCalledWith('upload');
  });
});
