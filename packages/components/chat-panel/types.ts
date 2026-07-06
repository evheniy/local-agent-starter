import type { ComponentProps, FC } from 'react';

/** Props for the ChatPanel component. */
export type ChatPanelProps = {
  question: string;
  answer?: string;
  canSubmit?: boolean;
  isLoading?: boolean;
  error?: string;
  onQuestionChange?: (question: string) => void;
  onSubmit?: () => void | Promise<void>;
} & Omit<ComponentProps<'section'>, 'onSubmit'>;

/** ChatPanel component type. */
export type ChatPanelType = FC<ChatPanelProps>;
