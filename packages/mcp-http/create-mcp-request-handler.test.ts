import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { getRequest, getResponse } from './test-utils.js';

import type { CreateMcpServerType, CreateMcpTransportType, ReadJsonBodyType } from './types.js';

const connectMock = jest.fn<() => Promise<void>>();
const closeServerMock = jest.fn<() => Promise<void>>();
const handleRequestMock = jest.fn<(_req?: unknown, _res?: unknown, _body?: unknown) => Promise<void>>();
const closeTransportMock = jest.fn<() => Promise<void>>();
const mockCreateMcpServer = jest.fn(() => ({
  close: closeServerMock,
  connect: connectMock,
}));
const mockStreamableHTTPServerTransport = jest.fn().mockImplementation(() => ({
  close: closeTransportMock,
  handleRequest: handleRequestMock,
}));

jest.mock('@p/mcp', () => ({
  createMcpServer: mockCreateMcpServer,
}));

jest.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: mockStreamableHTTPServerTransport,
}));

const loadCreateMcpRequestHandler = async () =>
  (await import('./create-mcp-request-handler.js')).createMcpRequestHandler;

describe('createMcpRequestHandler', () => {
  const createServer = jest.fn<CreateMcpServerType>(() => ({
    close: closeServerMock,
    connect: connectMock,
  }));
  const createTransport = jest.fn<CreateMcpTransportType>(() => ({
    close: closeTransportMock,
    handleRequest: handleRequestMock,
  }));
  const readJsonBody = jest.fn<ReadJsonBodyType>();
  const logger = {
    error: jest.fn(),
  };

  beforeEach(() => {
    createServer.mockClear();
    createTransport.mockClear();
    mockCreateMcpServer.mockClear();
    mockStreamableHTTPServerTransport.mockClear();
    connectMock.mockResolvedValue(undefined);
    closeServerMock.mockResolvedValue(undefined);
    handleRequestMock.mockResolvedValue(undefined);
    closeTransportMock.mockResolvedValue(undefined);
    readJsonBody.mockResolvedValue(undefined);
    logger.error.mockClear();
  });

  it('returns a JSON-RPC method error for non-POST MCP requests', async () => {
    const createMcpRequestHandler = await loadCreateMcpRequestHandler();
    const response = getResponse();
    const handler = createMcpRequestHandler({
      createServer,
      createTransport,
      logger,
      readJsonBody,
    });

    await handler(getRequest(), response);

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
    expect(createServer).not.toHaveBeenCalled();
  });

  it('defaults missing MCP request methods to GET', async () => {
    const createMcpRequestHandler = await loadCreateMcpRequestHandler();
    const response = getResponse();
    const handler = createMcpRequestHandler({
      createServer,
      createTransport,
      logger,
      readJsonBody,
    });

    await handler({ url: '/mcp' } as Parameters<typeof handler>[0], response);

    expect(response.writeHeadMock).toHaveBeenCalledWith(405, {
      'content-type': 'application/json; charset=utf-8',
    });
  });

  it('handles POST MCP requests', async () => {
    const createMcpRequestHandler = await loadCreateMcpRequestHandler();
    const request = getRequest('POST');
    const response = getResponse();
    const body = { jsonrpc: '2.0' };
    const handler = createMcpRequestHandler({
      createServer,
      createTransport,
      logger,
      readJsonBody,
    });

    readJsonBody.mockResolvedValue(body);

    await handler(request, response);

    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(handleRequestMock).toHaveBeenCalledWith(request, response, body);
    expect(closeTransportMock).toHaveBeenCalledTimes(1);
    expect(closeServerMock).toHaveBeenCalledTimes(1);
  });

  it('creates a stateless Streamable HTTP transport by default', async () => {
    const createMcpRequestHandler = await loadCreateMcpRequestHandler();
    const request = getRequest('POST');
    const response = getResponse();
    const body = { jsonrpc: '2.0' };
    const handler = createMcpRequestHandler({
      createServer,
      logger,
      readJsonBody,
    });

    readJsonBody.mockResolvedValue(body);

    await handler(request, response);

    expect(mockStreamableHTTPServerTransport).toHaveBeenCalledWith({
      sessionIdGenerator: undefined,
    });
    expect(handleRequestMock).toHaveBeenCalledWith(request, response, body);
  });

  it('creates the MCP server by default', async () => {
    const createMcpRequestHandler = await loadCreateMcpRequestHandler();
    const request = getRequest('POST');
    const response = getResponse();
    const body = { jsonrpc: '2.0' };
    const handler = createMcpRequestHandler({
      createTransport,
      logger,
      readJsonBody,
    });

    readJsonBody.mockResolvedValue(body);

    await handler(request, response);

    expect(mockCreateMcpServer).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledTimes(1);
  });

  it('writes an internal JSON-RPC error when request handling fails', async () => {
    const createMcpRequestHandler = await loadCreateMcpRequestHandler();
    const response = getResponse();
    const error = new Error('boom');
    const handler = createMcpRequestHandler({
      createServer,
      createTransport,
      logger,
      readJsonBody,
    });

    handleRequestMock.mockRejectedValue(error);

    await handler(getRequest('POST'), response);

    expect(logger.error).toHaveBeenCalledWith(error);
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
    const createMcpRequestHandler = await loadCreateMcpRequestHandler();
    const response = getResponse(true);
    const handler = createMcpRequestHandler({
      createServer,
      createTransport,
      logger,
      readJsonBody,
    });

    handleRequestMock.mockRejectedValue(new Error('boom'));

    await handler(getRequest('POST'), response);

    expect(response.writeHeadMock).not.toHaveBeenCalled();
  });
});
