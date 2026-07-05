import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('api public API', () => {
  it('exports the html handler', () => {
    expect(publicApi.html).toBeDefined();
  });
});
