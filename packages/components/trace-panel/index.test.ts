import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('trace-panel public API', () => {
  it('exports TracePanel', () => {
    expect(publicApi.TracePanel).toBeDefined();
  });
});
