import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('profile-card public API', () => {
  it('exports ProfileCard', () => {
    expect(publicApi.ProfileCard).toBeDefined();
  });
});
