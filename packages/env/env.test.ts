import { afterEach, describe, expect, it } from '@jest/globals';

import { getApi, getCdn, getUi } from './env.js';

describe('env getters', () => {
  afterEach(() => {
    delete process.env.API;
    delete process.env.CDN;
    delete process.env.UI;
  });

  it('reads required environment values', () => {
    process.env.API = 'http://localhost:3000';
    process.env.CDN = 'http://localhost:3001';
    process.env.UI = 'http://localhost:3002';

    expect(getApi()).toBe('http://localhost:3000');
    expect(getCdn()).toBe('http://localhost:3001');
    expect(getUi()).toBe('http://localhost:3002');
  });

  it('throws when a required environment value is missing', () => {
    expect(() => getUi()).toThrow('Environment variable UI is not defined!');
  });
});
