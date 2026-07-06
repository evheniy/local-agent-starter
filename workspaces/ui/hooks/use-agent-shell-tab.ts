import { useState } from 'react';

import type { AgentShellTab } from '@p/components/agent-shell';

export const useAgentShellTab = (initialTab: AgentShellTab = 'chat') => {
  const [tab, setTab] = useState<AgentShellTab>(initialTab);

  return {
    tab,
    setTab,
  };
};
