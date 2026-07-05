import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('avatar public API', () => {
  it('exports Avatar', () => {
    expect(publicApi.Avatar).toBeDefined();
  });
});
