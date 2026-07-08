import { afterEach, describe, expect, it } from '@jest/globals';

import { getApiBaseUrl } from './get-api-base-url.js';

describe('getApiBaseUrl', () => {
  const previousApi = process.env.API;

  afterEach(() => {
    if (previousApi === undefined) {
      delete process.env.API;
    } else {
      process.env.API = previousApi;
    }
  });

  it('uses API when configured', () => {
    process.env.API = 'http://localhost:3000';

    expect(getApiBaseUrl()).toBe('http://localhost:3000');
  });

  it('falls back to browser origin', () => {
    delete process.env.API;

    expect(getApiBaseUrl()).toBe('http://localhost');
  });
});
