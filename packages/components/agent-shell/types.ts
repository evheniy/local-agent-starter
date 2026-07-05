import type { ComponentProps, FC } from 'react';

/** Tab value for the AgentShell component. */
export type AgentShellTab = 'chat' | 'upload';

/** Props for the AgentShell component. */
export type AgentShellProps = {
  defaultTab?: AgentShellTab;
} & ComponentProps<'section'>;

/** AgentShell component type. */
export type AgentShellType = FC<AgentShellProps>;
