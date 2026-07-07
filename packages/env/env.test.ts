import { afterEach, describe, expect, it } from '@jest/globals';

import { getApi, getDocsDir, getUi } from './env.js';

describe('env getters', () => {
  afterEach(() => {
    delete process.env.API;
    delete process.env.DOCS_DIR;
    delete process.env.NODE_ENV;
    delete process.env.UI;
  });

  it('reads required environment values', () => {
    process.env.API = 'http://localhost:3000';
    process.env.UI = 'http://localhost:3001';

    expect(getApi()).toBe('http://localhost:3000');
    expect(getUi()).toBe('http://localhost:3001');
  });

  it('throws when a required environment value is missing', () => {
    expect(() => getUi()).toThrow('Environment variable UI is not defined!');
  });

  it('uses the local docs directory by default', () => {
    expect(getDocsDir()).toMatch(/docker\/docs$/u);
  });

  it('uses the Docker docs directory in production by default', () => {
    process.env.NODE_ENV = 'production';

    expect(getDocsDir()).toBe('/app/docs');
  });

  it('uses a configured docs directory', () => {
    process.env.DOCS_DIR = 'custom/docs';

    expect(getDocsDir()).toMatch(/custom\/docs$/u);
  });

  it('uses the local docs directory when development inherits the Docker docs path', () => {
    process.env.NODE_ENV = 'development';
    process.env.DOCS_DIR = '/app/docs';

    expect(getDocsDir()).toMatch(/docker\/docs$/u);
  });
});
