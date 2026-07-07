import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('env public API', () => {
  it('exports env getters', () => {
    expect(publicApi.getApi).toBeDefined();
    expect(publicApi.getDocsDir).toBeDefined();
    expect(publicApi.getUi).toBeDefined();
  });
});
