import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('icon-link public API', () => {
  it('exports IconLink', () => {
    expect(publicApi.IconLink).toBeDefined();
  });
});
