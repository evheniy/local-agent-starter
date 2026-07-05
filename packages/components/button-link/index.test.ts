import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('button-link public API', () => {
  it('exports ButtonLink', () => {
    expect(publicApi.ButtonLink).toBeDefined();
  });
});
