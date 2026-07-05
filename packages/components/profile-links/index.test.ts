import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('profile-links public API', () => {
  it('exports ProfileLinks', () => {
    expect(publicApi.ProfileLinks).toBeDefined();
  });
});
