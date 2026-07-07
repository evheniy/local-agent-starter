import type { ComponentProps, FC, SubmitEventHandler } from 'react';

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
