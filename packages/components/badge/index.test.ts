import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('badge public API', () => {
  it('exports Badge', () => {
    expect(publicApi.Badge).toBeDefined();
  });
});
