import { useState } from 'react';

import { streamChat } from '@p/ui';
import type { UseChatPanelStateResult, UseChatPanelStateType } from './types.js';
import type { ChatMessage } from '@p/components/chat-panel';

const createMessageId = () => `message-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const getErrorMessage = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'Stream disconnected.';
  }

  return error instanceof Error ? error.message : 'Chat failed.';
};

export const useChatPanelState: UseChatPanelStateType = ({ files = [] } = {}) => {
  const [error, setError] = useState<UseChatPanelStateResult['error']>();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState('');
  const hasIndexedFiles = files.some((file) => file.status === 'indexed');
  const canSubmit = Boolean(question.trim()) && !isLoading;
  const answer = [...messages].reverse().find((message) => message.role === 'assistant')?.content ?? '';

  const updateAssistantMessage = (id: string, update: (message: ChatMessage) => ChatMessage) => {
    setMessages((items) => items.map((message) => (message.id === id ? update(message) : message)));
  };

  const submitQuestion = async () => {
    if (!canSubmit) {
      return;
    }

    const message = question.trim();
    const assistantId = createMessageId();

    setError(undefined);
    setIsLoading(true);
    setQuestion('');
    setMessages((items) => [
      ...items,
      {
        id: createMessageId(),
        role: 'user',
        content: message,
        status: 'done',
      },
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        sources: [],
      },
    ]);

    try {
      await streamChat({
        message,
        limit: 5,
        handlers: {
          onSources: (sources) => {
            updateAssistantMessage(assistantId, (assistant) => ({
              ...assistant,
              sources,
            }));
          },
          onDelta: (text) => {
            updateAssistantMessage(assistantId, (assistant) => ({
              ...assistant,
              content: `${assistant.content}${text}`,
            }));
          },
          onDone: () => {
            updateAssistantMessage(assistantId, (assistant) => ({
              ...assistant,
              status: 'done',
            }));
          },
          onError: (streamError) => {
            setError(streamError);
            updateAssistantMessage(assistantId, (assistant) => ({
              ...assistant,
              status: 'error',
              error: streamError,
            }));
          },
        },
      });
    } catch (streamError) {
      const message = getErrorMessage(streamError);

      setError(message);
      updateAssistantMessage(assistantId, (assistant) => ({
        ...assistant,
        status: 'error',
        error: message,
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    answer,
    canSubmit,
    error,
    hasIndexedFiles,
    isLoading,
    messages,
    onQuestionChange: setQuestion,
    onSubmit: submitQuestion,
    question,
  };
};
