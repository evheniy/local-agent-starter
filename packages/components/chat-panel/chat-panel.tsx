import { useState } from 'react';
import type { FormEvent } from 'react';
import { cn } from '@vyriy/cn';

import type { ChatPanelType } from './types.js';

/** Renders a presentational question input and answer area for chat. */
export const ChatPanel: ChatPanelType = ({
  defaultQuestion = '',
  answer,
  isLoading = false,
  error,
  onSubmit,
  className,
  ...props
}) => {
  const [question, setQuestion] = useState(defaultQuestion);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    void onSubmit?.(trimmedQuestion);
  };

  return (
    <section className={cn('chat-panel', className)} {...props}>
      <form className="chat-panel__form" onSubmit={handleSubmit}>
        <label className="chat-panel__label" htmlFor="agent-question">
          Question
        </label>
        <textarea
          id="agent-question"
          className="chat-panel__input"
          value={question}
          placeholder="Ask about your indexed files..."
          rows={5}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button className="chat-panel__submit" type="submit" disabled={!question.trim() || isLoading}>
          {isLoading ? 'Streaming answer...' : 'Ask'}
        </button>
      </form>
      {error ? <p className="chat-panel__error">{error}</p> : null}
      <div className="chat-panel__answer" aria-live="polite">
        <h2 className="chat-panel__answer-title">Answer</h2>
        <p className="chat-panel__answer-body">
          {isLoading ? 'Waiting for streamed response...' : answer || 'The answer will appear here.'}
        </p>
      </div>
    </section>
  );
};
