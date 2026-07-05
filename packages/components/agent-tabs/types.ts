import type { ComponentProps, FC } from 'react';

/** Value for the AgentTabs component. */
export type AgentTabsValue = 'chat' | 'upload';

/** Props for the AgentTabs component. */
export type AgentTabsProps = {
  value: AgentTabsValue;
  onValueChange?: (value: AgentTabsValue) => void;
} & ComponentProps<'div'>;

/** AgentTabs component type. */
export type AgentTabsType = FC<AgentTabsProps>;
