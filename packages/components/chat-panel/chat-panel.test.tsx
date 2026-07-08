import { describe, it, expect, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';

import { ChatPanel } from './chat-panel.js';

describe('ChatPanel', () => {
  it('calls onSubmit with the entered question', () => {
    const onSubmit = jest.fn<(question: string) => void>();
    const onQuestionChange = jest.fn<(question: string) => void>();

    const { rerender } = render(
      <ChatPanel question="" onQuestionChange={onQuestionChange} onSubmit={() => onSubmit('What is indexed?')} />,
    );
    fireEvent.change(screen.getByLabelText('Question'), { target: { value: 'What is indexed?' } });

    expect(onQuestionChange).toHaveBeenCalledWith('What is indexed?');
    rerender(
      <ChatPanel
        question="What is indexed?"
        onQuestionChange={onQuestionChange}
        onSubmit={() => onSubmit('What is indexed?')}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Ask' }));
    expect(onSubmit).toHaveBeenCalledWith('What is indexed?');
  });

  it('submits with Enter and keeps Shift+Enter for new lines', () => {
    const onSubmit = jest.fn<() => void>();

    render(<ChatPanel question="What is indexed?" onSubmit={onSubmit} />);
    fireEvent.keyDown(screen.getByLabelText('Question'), { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(screen.getByLabelText('Question'), { key: 'Enter' });

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('does not submit empty or loading questions', () => {
    const onSubmit = jest.fn<() => void>();

    const { rerender } = render(<ChatPanel question="" onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByLabelText('Question').closest('form') as HTMLFormElement);

    rerender(<ChatPanel question="What is indexed?" isLoading onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByLabelText('Question').closest('form') as HTMLFormElement);

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders loading, answer, and error states', () => {
    render(<ChatPanel question="What is indexed?" answer="A streamed answer." error="Could not answer." isLoading />);

    expect(screen.getByText('Streaming answer...')).toBeDefined();
    expect(screen.getByText('Could not answer.')).toBeDefined();
    expect(screen.getByText('Waiting for streamed response...')).toBeDefined();
  });

  it('renders the empty answer placeholder', () => {
    render(<ChatPanel question="" />);

    expect(screen.getByText('The answer will appear here.')).toBeDefined();
  });

  it('renders streamed messages and sources', () => {
    render(
      <ChatPanel
        question=""
        messages={[
          {
            id: 'user-1',
            role: 'user',
            content: 'What is indexed?',
          },
          {
            id: 'assistant-1',
            role: 'assistant',
            content: 'The project indexes local files.',
            status: 'done',
            sources: [
              {
                documentTitle: 'README.md',
                path: 'docs/README.md',
                chunkIndex: 2,
                score: 0.82,
                contentPreview: 'Local RAG starter.',
              },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText('What is indexed?')).toBeDefined();
    expect(screen.getByText('The project indexes local files.')).toBeDefined();
    expect(screen.getByText('Sources')).toBeDefined();
    expect(screen.getByText('README.md')).toBeDefined();
    expect(screen.getByText('docs/README.md · chunk 2')).toBeDefined();
    expect(screen.getByText('Local RAG starter.')).toBeDefined();
  });

  it('renders source and empty answer fallbacks', () => {
    render(
      <ChatPanel
        question=""
        messages={[
          {
            id: 'assistant-1',
            role: 'assistant',
            content: '',
            status: 'done',
            sources: [
              {
                path: 'docs/fallback.md',
              },
              {},
            ],
          },
        ]}
      />,
    );

    expect(screen.getByText('No answer text returned.')).toBeDefined();
    expect(screen.getAllByText('docs/fallback.md')).toHaveLength(2);
    expect(screen.getByText('Untitled source')).toBeDefined();
    expect(screen.getByText('Local document')).toBeDefined();
  });

  it('renders empty, no-indexed-files, streaming, and message error states', () => {
    const { rerender } = render(<ChatPanel question="" messages={[]} hasIndexedFiles={false} />);

    expect(screen.getByText('Ask a question about your indexed files.')).toBeDefined();
    expect(screen.getByText('Upload and index a document before asking questions.')).toBeDefined();

    rerender(
      <ChatPanel
        question=""
        messages={[
          {
            id: 'assistant-1',
            role: 'assistant',
            content: '',
            status: 'streaming',
          },
          {
            id: 'assistant-2',
            role: 'assistant',
            content: 'Partial',
            status: 'error',
            error: 'LLM offline.',
          },
        ]}
      />,
    );

    expect(screen.getByText('Thinking with indexed documents...')).toBeDefined();
    expect(screen.getByText('Streaming...')).toBeDefined();
    expect(screen.getByText('LLM offline.')).toBeDefined();
  });
});
