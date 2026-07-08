import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('api public API', () => {
  it('exports API handlers', () => {
    expect(publicApi.chat).toBeDefined();
    expect(publicApi.files).toBeDefined();
    expect(publicApi.html).toBeDefined();
    expect(publicApi.indexFile).toBeDefined();
    expect(publicApi.upload).toBeDefined();
  });
});
