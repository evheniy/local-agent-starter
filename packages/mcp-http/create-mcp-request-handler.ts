import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import { createMcpServer } from '@p/mcp';
import { jsonRpcError } from './json-rpc-error.js';
import { readJsonBody as readStoredJsonBody } from './read-json-body.js';

import type { CreateMcpRequestHandlerOptions, HttpHandler, McpServerLike } from './types.js';

export const createMcpRequestHandler = ({
  createServer = () => createMcpServer() as unknown as McpServerLike,
  createTransport = () =>
    new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    }),
  logger = console,
  readJsonBody = readStoredJsonBody,
}: CreateMcpRequestHandlerOptions = {}): HttpHandler => {
  return async (req, res) => {
    if ((req.method ?? 'GET') !== 'POST') {
      jsonRpcError(res, 405, -32000, 'Method not allowed.');
      return;
    }

    const server = createServer();
    const transport = createTransport();

    try {
      const body = await readJsonBody(req);

      await server.connect(transport);
      await transport.handleRequest(req, res, body);
    } catch (error) {
      logger.error(error);

      if (!res.headersSent) {
        jsonRpcError(res, 500, -32603, 'Internal server error.');
      }
    } finally {
      await transport.close();
      await server.close();
    }
  };
};
