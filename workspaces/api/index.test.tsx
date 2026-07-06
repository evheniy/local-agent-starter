import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it, jest } from '@jest/globals';
import type { APIGatewayProxyEvent } from '@vyriy/router';

const apiMock = jest.fn((handler) => ({ handler }));
const serverMock = jest.fn();
const staticMock = jest.fn();
type RouterApi = {
  get: (...args: unknown[]) => RouterApi;
  post: (...args: unknown[]) => RouterApi;
  route: (...args: unknown[]) => unknown;
  static: (...args: unknown[]) => RouterApi;
};

jest.mock('@vyriy/handler', () => ({
  api: apiMock,
}));

jest.mock('@vyriy/static', () => ({
  withStatic: jest.fn((router: RouterApi) => {
    const wrapped: RouterApi = {
      get: (...args) => {
        router.get(...args);

        return wrapped;
      },
      post: (...args) => {
        router.post(...args);

        return wrapped;
      },
      route: (...args) => router.route(...args),
      static: (...args) => {
        staticMock(...args);

        return wrapped;
      },
    };

    return wrapped;
  }),
}));

jest.mock('@vyriy/server', () => ({
  server: serverMock,
}));

jest.mock('@p/env', () => ({
  getUi: () => 'http://localhost:3002',
}));

describe('workspaces/api/index.tsx', () => {
  type ApiHandler = (event: APIGatewayProxyEvent) => Promise<{
    body: string;
    headers?: Record<string, string>;
    statusCode: number;
  }>;

  const getEvent = (path: string): APIGatewayProxyEvent =>
    ({
      body: null,
      headers: {},
      httpMethod: 'GET',
      path,
      pathParameters: null,
      queryStringParameters: null,
    }) as APIGatewayProxyEvent;

  const getUploadEvent = (): APIGatewayProxyEvent =>
    ({
      body: 'hello docs',
      headers: {},
      httpMethod: 'POST',
      isBase64Encoded: false,
      multiValueHeaders: {},
      multiValueQueryStringParameters: {},
      path: '/upload',
      pathParameters: null,
      queryStringParameters: {
        filename: 'AGENTS.md',
      },
      requestContext: {},
      resource: '/upload',
      stageVariables: null,
    }) as unknown as APIGatewayProxyEvent;

  const loadHandler = async (): Promise<ApiHandler> => {
    await jest.isolateModulesAsync(async () => {
      await import('./index.js');
    });

    expect(apiMock).toHaveBeenCalledTimes(1);
    expect(serverMock).toHaveBeenCalledTimes(1);
    expect(serverMock).toHaveBeenCalledWith(apiMock.mock.results[0]?.value);

    return apiMock.mock.calls[0]?.[0] as ApiHandler;
  };

  it('starts the server with the API handler', async () => {
    await loadHandler();

    expect(apiMock).toHaveBeenCalledTimes(1);
  });

  it('mounts built UI static assets', async () => {
    const handler = await loadHandler();

    await handler(getEvent('/'));

    expect(staticMock).toHaveBeenCalledWith('/static', expect.stringMatching(/static$/u), { cache: 'static' });
  });

  it('renders the local agent page for the root route', async () => {
    const handler = await loadHandler();
    const response = await handler(getEvent('/'));

    expect(response).toEqual({
      body: expect.any(String),
      headers: {
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'content-type': 'text/html; charset=utf-8',
        'x-content-type-options': 'nosniff',
      },
      isBase64Encoded: undefined,
      multiValueHeaders: undefined,
      statusCode: 200,
    });
    expect(response.body).toContain('<title>Local Agent Starter</title>');
    expect(response.body).toContain('href="http://localhost:3002/main.css"');
    expect(response.body).toContain('<div id="root" rendered>');
    expect(response.body).toContain('Local Agent Starter');
    expect(response.body).toContain('Application Trace');
    expect(response.body).toContain('Retrieved Chunks');
    expect(response.body).toMatch(/src\s*=\s*"http:\/\/localhost:3002\/index\.js"/);
  });

  it('returns not found for unknown routes', async () => {
    const handler = await loadHandler();

    await expect(handler(getEvent('/missing'))).resolves.toEqual({
      body: JSON.stringify({
        message: 'Not Found',
      }),
      statusCode: 404,
    });
  });

  it('routes file uploads', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-docs-'));
    const handler = await loadHandler();

    try {
      process.env.DOCS_DIR = docsDir;

      await expect(handler(getUploadEvent())).resolves.toMatchObject({
        body: expect.stringContaining('"filename":"AGENTS.md"'),
        statusCode: 201,
      });
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });
});
