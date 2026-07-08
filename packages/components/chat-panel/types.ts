import type { ComponentProps, FC, SubmitEventHandler } from 'react';

export type ChatSource = {
  documentTitle?: string;
  path?: string;
  chunkIndex?: number;
  score?: number;
  contentPreview?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  status?: 'streaming' | 'done' | 'error' | 'cancelled';
  error?: string;
};

/** Props for the ChatPanel component. */
export type ChatPanelProps = {
  question: string;
  answer?: string;
  canSubmit?: boolean;
  emptyState?: string;
  hasIndexedFiles?: boolean;
  isLoading?: boolean;
  messages?: ChatMessage[];
  error?: string;
  onQuestionChange?: (question: string) => void;
  onSubmit?: () => void | Promise<void>;
} & Omit<ComponentProps<'section'>, 'onSubmit'>;

/** ChatPanel component type. */
export type ChatPanelType = FC<ChatPanelProps>;

/** Options for creating a ChatPanel submit handler. */
export type HandleSubmitOptions = {
  canSubmit: boolean;
  isLoading: boolean;
};

/** Creates a ChatPanel submit event handler. */
export type HandleSubmitType = (
  onSubmit: ChatPanelProps['onSubmit'],
  options: HandleSubmitOptions,
) => SubmitEventHandler<HTMLFormElement>;
