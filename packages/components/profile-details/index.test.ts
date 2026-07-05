import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('profile-details public API', () => {
  it('exports ProfileDetails', () => {
    expect(publicApi.ProfileDetails).toBeDefined();
  });
});
