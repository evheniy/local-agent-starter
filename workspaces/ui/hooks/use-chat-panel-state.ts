import { useState } from 'react';

import type { UseChatPanelStateResult, UseChatPanelStateType } from './types.js';

const INITIAL_QUESTION = 'What does this project already know about pgvector?';

export const useChatPanelState: UseChatPanelStateType = () => {
  const [answer, setAnswer] = useState('This placeholder answer will later be streamed from the local chat service.');
  const [error, setError] = useState<UseChatPanelStateResult['error']>();
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState(INITIAL_QUESTION);
  const canSubmit = Boolean(question.trim()) && !isLoading;

  const submitQuestion = () => {
    if (!canSubmit) {
      return;
    }

    setError(undefined);
    setIsLoading(true);
    setAnswer(`Queued local question: ${question.trim()}`);
    setIsLoading(false);
  };

  return {
    answer,
    canSubmit,
    error,
    isLoading,
    question,
    setQuestion,
    submitQuestion,
  };
};
