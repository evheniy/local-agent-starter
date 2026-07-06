import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { create } from '@vyriy/handler';
import { createHttpRouter } from '@vyriy/router';
import { httpServer } from '@vyriy/server';
import { getBody } from '@vyriy/server/body';

import { createMcpServer } from '@p/mcp';

const HTTP_HEADERS = {
  'access-control-allow-headers': 'content-type, mcp-protocol-version',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-origin': '*',
  'x-content-type-options': 'nosniff',
};

const json = (res: ServerResponse, statusCode: number, body: unknown) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

const jsonRpcError = (res: ServerResponse, statusCode: number, code: number, message: string) =>
  json(res, statusCode, {
    jsonrpc: '2.0',
    error: { code, message },
    id: null,
  });

const readJsonBody = async (req: IncomingMessage) => {
  const body = (await getBody(req))?.trim();

  return body ? (JSON.parse(body) as unknown) : undefined;
};

const handleMcpRequest = async (req: IncomingMessage, res: ServerResponse) => {
  if ((req.method ?? 'GET') !== 'POST') {
    jsonRpcError(res, 405, -32000, 'Method not allowed.');
    return;
  }

  const server = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  try {
    const body = await readJsonBody(req);

    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (error) {
    console.error(error);

    if (!res.headersSent) {
      jsonRpcError(res, 500, -32603, 'Internal server error.');
    }
  } finally {
    await transport.close();
    await server.close();
  }
};

export const createHttpHandler = () => {
  const router = createHttpRouter();

  router.all('/mcp', handleMcpRequest);

  router.fallback((_req, res) => {
    json(res, 404, {
      message: 'Not found.',
    });
  });

  return create.httpApi({
    headers: HTTP_HEADERS,
    healthcheck: {
      body: {
        ok: true,
        name: 'local-agent-mcp',
        transport: 'streamable-http',
      },
    },
  })(router.handle());
};

export const startHttpServer = async () => {
  const server = httpServer(createHttpHandler());

  await new Promise<void>((resolve, reject) => {
    if (server.listening) {
      resolve();
      return;
    }

    server.once('error', reject);
    server.once('listening', resolve);
  });

  const address = server.address() as AddressInfo;

  console.warn(`Local Agent MCP HTTP server listening on http://localhost:${address.port}/mcp`);

  return server;
};
