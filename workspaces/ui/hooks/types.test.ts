import { describe, expect, it } from '@jest/globals';

import type { UseAgentShellTabResult, UseChatPanelStateResult, UseFileUploadStateResult } from './types.js';

describe('ui hook types', () => {
  it('allows hook result shapes', () => {
    const agentShellTab: UseAgentShellTabResult['tab'] = 'chat';
    const chatError: UseChatPanelStateResult['error'] = undefined;
    const fileUploadStatus: UseFileUploadStateResult['status'] = 'idle';

    expect(agentShellTab).toBe('chat');
    expect(chatError).toBeUndefined();
    expect(fileUploadStatus).toBe('idle');
  });
});
