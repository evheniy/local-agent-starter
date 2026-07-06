import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from '@jest/globals';

import { useAgentShellTab } from './use-agent-shell-tab.js';

describe('useAgentShellTab', () => {
  it('keeps the selected agent shell tab', () => {
    const { result } = renderHook(() => useAgentShellTab());

    expect(result.current.tab).toBe('chat');

    act(() => {
      result.current.setTab('upload');
    });

    expect(result.current.tab).toBe('upload');
  });
});
