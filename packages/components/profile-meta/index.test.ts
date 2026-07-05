import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('profile-meta public API', () => {
  it('exports ProfileMeta', () => {
    expect(publicApi.ProfileMeta).toBeDefined();
  });
});
