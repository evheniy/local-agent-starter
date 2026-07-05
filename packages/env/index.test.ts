import { afterEach, describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

const ENV_NAMES = [
  'API',
  'CDN',
  'UI',
] as const;

const clearEnv = () => {
  for (const name of ENV_NAMES) {
    delete process.env[name];
  }
};

describe('env public API', () => {
  afterEach(() => {
    clearEnv();
  });

  it('exports env getters', () => {
    expect(publicApi.getApi).toBeDefined();
    expect(publicApi.getCdn).toBeDefined();
    expect(publicApi.getUi).toBeDefined();
  });

  it('reads environment variables by public getter name', () => {
    process.env.API = 'http://localhost:3000';
    process.env.CDN = 'http://localhost:3001';
    process.env.UI = 'http://localhost:3002';

    expect(publicApi.getApi()).toBe('http://localhost:3000');
    expect(publicApi.getCdn()).toBe('http://localhost:3001');
    expect(publicApi.getUi()).toBe('http://localhost:3002');
  });

  it('throws when a required environment variable is missing', () => {
    clearEnv();

    expect(() => publicApi.getApi()).toThrow('Environment variable API is not defined!');
  });
});
