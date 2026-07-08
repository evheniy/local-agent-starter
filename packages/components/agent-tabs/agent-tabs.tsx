import { cn } from '@vyriy/cn';

import type { AgentTabsType, AgentTabsValue } from './types.js';

const tabs: Array<{ label: string; value: AgentTabsValue }> = [
  { label: 'Chat', value: 'chat' },
  { label: 'Upload', value: 'upload' },
];

/** Renders the local agent app tab switcher. */
export const AgentTabs: AgentTabsType = ({ value, onValueChange, className, ...props }) => {
  return (
    <div className={cn('agent-tabs', className)} role="tablist" aria-label="Local agent modes" {...props}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          id={`agent-tab-${tab.value}`}
          className={cn('agent-tabs__tab', value === tab.value && 'agent-tabs__tab--active')}
          type="button"
          role="tab"
          aria-controls={`agent-panel-${tab.value}`}
          aria-selected={value === tab.value}
          tabIndex={value === tab.value ? 0 : -1}
          onClick={() => onValueChange?.(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
