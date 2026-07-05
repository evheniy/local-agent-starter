import type { ComponentProps, FC } from 'react';

/** Props for the ChatPanel component. */
export type ChatPanelProps = {
  defaultQuestion?: string;
  answer?: string;
  isLoading?: boolean;
  error?: string;
  onSubmit?: (question: string) => void | Promise<void>;
} & Omit<ComponentProps<'section'>, 'onSubmit'>;

/** ChatPanel component type. */
export type ChatPanelType = FC<ChatPanelProps>;
