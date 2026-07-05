import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('profile-tags public API', () => {
  it('exports ProfileTags', () => {
    expect(publicApi.ProfileTags).toBeDefined();
  });
});
