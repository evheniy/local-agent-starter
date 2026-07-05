import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('agent-tabs public API', () => {
  it('exports AgentTabs', () => {
    expect(publicApi.AgentTabs).toBeDefined();
  });
});
