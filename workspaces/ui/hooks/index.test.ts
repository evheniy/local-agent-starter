import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('ui hooks public API', () => {
  it('exports workspace UI hooks', () => {
    expect(publicApi.useAgentShellTab).toBeDefined();
    expect(publicApi.useChatPanelState).toBeDefined();
    expect(publicApi.useFileUploadState).toBeDefined();
  });
});
