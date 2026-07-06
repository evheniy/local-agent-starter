import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import type { IncomingMessage, ServerResponse } from 'node:http';

type HttpHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;
type MockServerResponse = ServerResponse & {
  endMock: jest.Mock;
  writeHeadMock: jest.Mock;
};

let allHandler: HttpHandler | undefined;
let fallbackHandler: HttpHandler | undefined;

const connectMock = jest.fn<() => Promise<void>>();
const closeServerMock = jest.fn<() => Promise<void>>();
const getBodyMock = jest.fn<() => Promise<string | undefined>>();
const handleRequestMock = jest.fn<(_req?: unknown, _res?: unknown, _body?: unknown) => Promise<void>>();
const closeTransportMock = jest.fn<() => Promise<void>>();

jest.mock('@vyriy/router', () => ({
  createHttpRouter: () => ({
    all: (_path: string, handler: HttpHandler) => {
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

jest.mock('@vyriy/server/body', () => ({
  getBody: getBodyMock,
}));

jest.mock('@p/mcp', () => ({
  createMcpServer: jest.fn(() => ({
    close: closeServerMock,
    connect: connectMock,
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: jest.fn().mockImplementation(() => ({
    close: closeTransportMock,
    handleRequest: handleRequestMock,
  })),
}));

const onceMock = jest.fn();
const addressMock = jest.fn(() => ({ port: 3003 }));
const httpServerMock = jest.fn(() => ({
  address: addressMock,
  listening: true,
  once: onceMock,
}));

jest.mock('@vyriy/server', () => ({
  httpServer: httpServerMock,
}));

const getResponse = (headersSent = false) => {
  const endMock = jest.fn();
  const writeHeadMock = jest.fn();

  return {
    end: endMock,
    endMock,
    headersSent,
    writeHead: writeHeadMock,
    writeHeadMock,
  } as unknown as MockServerResponse;
};

const getRequest = (method = 'GET') =>
  ({
    method,
    url: '/mcp',
  }) as IncomingMessage;

describe('workspaces/mcp/server', () => {
  beforeEach(() => {
    allHandler = undefined;
    fallbackHandler = undefined;
    connectMock.mockResolvedValue(undefined);
    closeServerMock.mockResolvedValue(undefined);
    getBodyMock.mockResolvedValue(undefined);
    handleRequestMock.mockResolvedValue(undefined);
    closeTransportMock.mockResolvedValue(undefined);
  });

  it('creates an HTTP handler with MCP and fallback routes', async () => {
    const { createHttpHandler } = await import('./server.js');

    const handler = createHttpHandler();
    const response = getResponse();

    await fallbackHandler?.(getRequest('/missing'), response);

    expect(handler).toMatchObject({
      handler: 'router-handler',
      options: {
        healthcheck: {
          body: {
            ok: true,
            name: 'local-agent-mcp',
            transport: 'streamable-http',
          },
        },
      },
    });
    expect(response.writeHeadMock).toHaveBeenCalledWith(404, {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(response.endMock).toHaveBeenCalledWith(JSON.stringify({ message: 'Not found.' }));
  });

  it('returns a JSON-RPC method error for non-POST MCP requests', async () => {
    const { createHttpHandler } = await import('./server.js');
    const response = getResponse();

    createHttpHandler();
    await allHandler?.(getRequest(), response);

    expect(response.writeHeadMock).toHaveBeenCalledWith(405, {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(response.endMock).toHaveBeenCalledWith(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      }),
    );
  });

  it('defaults missing MCP request methods to GET', async () => {
    const { createHttpHandler } = await import('./server.js');
    const response = getResponse();

    createHttpHandler();
    await allHandler?.({ url: '/mcp' } as IncomingMessage, response);

    expect(response.writeHeadMock).toHaveBeenCalledWith(405, {
      'content-type': 'application/json; charset=utf-8',
    });
  });

  it('handles POST MCP requests', async () => {
    const { createHttpHandler } = await import('./server.js');
    const request = getRequest('POST');
    const response = getResponse();

    getBodyMock.mockResolvedValue('{"jsonrpc":"2.0"}');
    createHttpHandler();
    await allHandler?.(request, response);

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(handleRequestMock).toHaveBeenCalledWith(request, response, {
      jsonrpc: '2.0',
    });
    expect(closeTransportMock).toHaveBeenCalledTimes(1);
    expect(closeServerMock).toHaveBeenCalledTimes(1);
  });

  it('writes an internal JSON-RPC error when request handling fails', async () => {
    const { createHttpHandler } = await import('./server.js');
    const response = getResponse();

    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    handleRequestMock.mockRejectedValue(new Error('boom'));
    createHttpHandler();
    await allHandler?.(getRequest('POST'), response);

    expect(response.writeHeadMock).toHaveBeenCalledWith(500, {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(response.endMock).toHaveBeenCalledWith(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error.' },
        id: null,
      }),
    );
  });

  it('does not write another error when headers were already sent', async () => {
    const { createHttpHandler } = await import('./server.js');
    const response = getResponse(true);

    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    handleRequestMock.mockRejectedValue(new Error('boom'));
    createHttpHandler();
    await allHandler?.(getRequest('POST'), response);

    expect(response.writeHeadMock).not.toHaveBeenCalled();
  });

  it('starts the HTTP server', async () => {
    const { startHttpServer } = await import('./server.js');

    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    await expect(startHttpServer()).resolves.toEqual(
      expect.objectContaining({
        listening: true,
      }),
    );

    expect(httpServerMock).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('Local Agent MCP HTTP server listening on http://localhost:3003/mcp');
  });

  it('waits for the HTTP server listening event', async () => {
    const { startHttpServer } = await import('./server.js');
    let listeningHandler: (() => void) | undefined;
    const server = {
      address: addressMock,
      listening: false,
      once: jest.fn((event: string, handler: () => void) => {
        if (event === 'listening') {
          listeningHandler = handler;
        }

        return server;
      }),
    };

    httpServerMock.mockReturnValueOnce(server as ReturnType<typeof httpServerMock>);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const started = startHttpServer();

    listeningHandler?.();

    await expect(started).resolves.toBe(server);
    expect(server.once).toHaveBeenCalledWith('error', expect.any(Function));
    expect(server.once).toHaveBeenCalledWith('listening', expect.any(Function));
  });
});
