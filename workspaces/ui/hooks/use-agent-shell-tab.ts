import { useState } from 'react';

import type { UseAgentShellTabResult, UseAgentShellTabType } from './types.js';

export const useAgentShellTab: UseAgentShellTabType = (initialTab = 'chat') => {
  const [tab, setTab] = useState<UseAgentShellTabResult['tab']>(initialTab);

  return {
    tab,
    setTab,
  };
};
