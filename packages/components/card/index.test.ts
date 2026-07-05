import { describe, it, expect } from '@jest/globals';
import * as publicApi from './index.js';

describe('card public API', () => {
  it('exports Card', () => {
    expect(publicApi.Card).toBeDefined();
  });
});
