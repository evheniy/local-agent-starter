import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('public API', () => {
  it('exports public components', () => {
    expect(publicApi.Avatar).toBeDefined();
    expect(publicApi.Badge).toBeDefined();
    expect(publicApi.ButtonLink).toBeDefined();
    expect(publicApi.Card).toBeDefined();
    expect(publicApi.IconLink).toBeDefined();
    expect(publicApi.ProfileCard).toBeDefined();
    expect(publicApi.ProfileDetails).toBeDefined();
    expect(publicApi.ProfileHeader).toBeDefined();
    expect(publicApi.ProfileLinks).toBeDefined();
    expect(publicApi.ProfileMeta).toBeDefined();
    expect(publicApi.ProfileTags).toBeDefined();
  });
});
