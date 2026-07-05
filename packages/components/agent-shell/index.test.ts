import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('agent-shell public API', () => {
  it('exports AgentShell', () => {
    expect(publicApi.AgentShell).toBeDefined();
  });
});
