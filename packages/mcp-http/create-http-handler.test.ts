import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { HEALTHCHECK_BODY, HTTP_HEADERS, MCP_PATH } from './constants.js';
import { getRequest, getResponse } from './test-utils.js';

import type { HttpHandler } from './types.js';

let allHandler: HttpHandler | undefined;
let fallbackHandler: HttpHandler | undefined;

jest.mock('./create-mcp-request-handler.js', () => ({
  createMcpRequestHandler: jest.fn(() => jest.fn()),
}));

jest.mock('@vyriy/router', () => ({
  createHttpRouter: () => ({
    all: (path: string, handler: HttpHandler) => {
      expect(path).toBe(MCP_PATH);
      allHandler = handler;
    },
    fallback: (handler: HttpHandler) => {
      fallbackHandler = handler;
    },
    handle: () => 'router-handler',
  }),
}));

jest.mock('@vyriy/handler', () => ({
  create: {
    httpApi: jest.fn((options) => (handler: unknown) => ({
      handler,
      options,
    })),
  },
}));

describe('createHttpHandler', () => {
  beforeEach(() => {
    allHandler = undefined;
    fallbackHandler = undefined;
  });

  it('creates an HTTP handler with MCP and fallback routes', async () => {
    const { createHttpHandler } = await import('./create-http-handler.js');
    const handleMcpRequest = jest.fn<HttpHandler>();
    const handler = createHttpHandler({ handleMcpRequest });
    const response = getResponse();

    await allHandler?.(getRequest('POST'), response);
    await fallbackHandler?.(getRequest('/missing'), response);

    expect(handler).toMatchObject({
      handler: 'router-handler',
      options: {
        headers: HTTP_HEADERS,
        healthcheck: {
          body: HEALTHCHECK_BODY,
        },
      },
    });
    expect(handleMcpRequest).toHaveBeenCalledWith(getRequest('POST'), response);
    expect(response.writeHeadMock).toHaveBeenCalledWith(404, {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(response.endMock).toHaveBeenCalledWith(JSON.stringify({ message: 'Not found.' }));
  });
});
