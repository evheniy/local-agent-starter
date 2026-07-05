import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('chat-panel public API', () => {
  it('exports ChatPanel', () => {
    expect(publicApi.ChatPanel).toBeDefined();
  });
});
