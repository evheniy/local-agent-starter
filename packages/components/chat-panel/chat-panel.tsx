import { cn } from '@vyriy/cn';

import { handleSubmit } from './handle-submit.js';
import type { ChatMessage, ChatPanelType } from './types.js';

const getSourceTitle = (source: NonNullable<ChatMessage['sources']>[number]) =>
  source.documentTitle ?? source.path ?? 'Untitled source';

const ChatSources = ({ sources = [] }: { sources?: ChatMessage['sources'] }) => {
  if (!sources.length) {
    return null;
  }

  return (
    <div className="chat-panel__sources">
      <h3 className="chat-panel__sources-title">Sources</h3>
      <ol className="chat-panel__sources-list">
        {sources.map((source, index) => (
          <li key={`${source.path ?? 'source'}-${source.chunkIndex ?? index}`} className="chat-panel__source">
            <div className="chat-panel__source-header">
              <span className="chat-panel__source-title">{getSourceTitle(source)}</span>
              {typeof source.score === 'number' ? (
                <span className="chat-panel__source-score">Score {source.score.toFixed(2)}</span>
              ) : null}
            </div>
            <p className="chat-panel__source-meta">
              {source.path ? source.path : 'Local document'}
              {typeof source.chunkIndex === 'number' ? ` · chunk ${source.chunkIndex}` : ''}
            </p>
            {source.contentPreview ? <p className="chat-panel__source-preview">{source.contentPreview}</p> : null}
          </li>
        ))}
      </ol>
    </div>
  );
};

const ChatMessageItem = ({ message }: { message: ChatMessage }) => (
  <li className={cn('chat-panel__message', `chat-panel__message--${message.role}`)}>
    <p className="chat-panel__message-role">{message.role === 'user' ? 'You' : 'Assistant'}</p>
    <p className="chat-panel__message-body">
      {message.content ||
        (message.status === 'streaming' ? 'Thinking with indexed documents...' : 'No answer text returned.')}
    </p>
    {message.status === 'streaming' ? <p className="chat-panel__message-status">Streaming...</p> : null}
    {message.status === 'error' && message.error ? <p className="chat-panel__message-error">{message.error}</p> : null}
    <ChatSources sources={message.sources} />
  </li>
);

/** Renders a presentational question input and answer area for chat. */
export const ChatPanel: ChatPanelType = ({
  question,
  answer,
  canSubmit = Boolean(question.trim()),
  emptyState = 'Ask a question about your indexed files.',
  hasIndexedFiles = true,
  isLoading = false,
  messages,
  error,
  onQuestionChange,
  onSubmit,
  className,
  ...props
}) => {
  return (
    <section className={cn('chat-panel', className)} {...props}>
      <form className="chat-panel__form" onSubmit={handleSubmit(onSubmit, { canSubmit, isLoading })}>
        <label className="chat-panel__label" htmlFor="agent-question">
          Question
        </label>
        <textarea
          id="agent-question"
          className="chat-panel__input"
          value={question}
          placeholder="Ask about your indexed files..."
          rows={5}
          onChange={(event) => onQuestionChange?.(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey && canSubmit && !isLoading) {
              event.preventDefault();
              void onSubmit?.();
            }
          }}
        />
        <button className="chat-panel__submit" type="submit" disabled={!question.trim() || isLoading}>
          {isLoading ? 'Streaming answer...' : 'Ask'}
        </button>
      </form>
      {!hasIndexedFiles ? (
        <p className="chat-panel__notice">Upload and index a document before asking questions.</p>
      ) : null}
      {error ? <p className="chat-panel__error">{error}</p> : null}
      {messages ? (
        <div className="chat-panel__messages" aria-live="polite">
          {messages.length ? (
            <ol className="chat-panel__message-list">
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
            </ol>
          ) : (
            <p className="chat-panel__empty">{emptyState}</p>
          )}
        </div>
      ) : (
        <div className="chat-panel__answer" aria-live="polite">
          <h2 className="chat-panel__answer-title">Answer</h2>
          <p className="chat-panel__answer-body">
            {isLoading ? 'Waiting for streamed response...' : answer || 'The answer will appear here.'}
          </p>
        </div>
      )}
    </section>
  );
};
