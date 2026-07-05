import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { ChatPanel } from './chat-panel.js';

describe('ChatPanel', () => {
  it('calls onSubmit with the entered question', () => {
    const onSubmit = jest.fn<(question: string) => void>();

    render(<ChatPanel onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'What is indexed?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));

    expect(onSubmit).toHaveBeenCalledWith('What is indexed?');
  });

  it('does not submit empty or loading questions', () => {
    const onSubmit = jest.fn<(question: string) => void>();

    const { rerender } = render(<ChatPanel onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByLabelText('Question').closest('form') as HTMLFormElement);

    rerender(<ChatPanel defaultQuestion="What is indexed?" isLoading onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByLabelText('Question').closest('form') as HTMLFormElement);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders loading, answer, and error states', () => {
    render(<ChatPanel answer="A streamed answer." error="Could not answer." isLoading />);

    expect(screen.getByText('Streaming answer...')).toBeDefined();
    expect(screen.getByText('Could not answer.')).toBeDefined();
    expect(screen.getByText('Waiting for streamed response...')).toBeDefined();
  });

  it('renders the empty answer placeholder', () => {
    render(<ChatPanel />);

    expect(screen.getByText('The answer will appear here.')).toBeDefined();
  });
});
