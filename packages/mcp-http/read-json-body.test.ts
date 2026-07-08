import { describe, expect, it, jest } from '@jest/globals';

import { getRequest } from './test-utils.js';

const getBodyMock = jest.fn<() => Promise<string | undefined>>();

jest.mock('@vyriy/server/body', () => ({
  getBody: getBodyMock,
}));

describe('readJsonBody', () => {
  it('parses JSON request bodies', async () => {
    const { readJsonBody } = await import('./read-json-body.js');

    getBodyMock.mockResolvedValue('  {"jsonrpc":"2.0"}  ');

    await expect(readJsonBody(getRequest('POST'))).resolves.toEqual({
      jsonrpc: '2.0',
    });
  });

  it('returns undefined for empty bodies', async () => {
    const { readJsonBody } = await import('./read-json-body.js');

    getBodyMock.mockResolvedValue('  ');

    await expect(readJsonBody(getRequest('POST'))).resolves.toBeUndefined();
  });
});
