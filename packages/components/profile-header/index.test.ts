import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('profile-header public API', () => {
  it('exports ProfileHeader', () => {
    expect(publicApi.ProfileHeader).toBeDefined();
  });
});
