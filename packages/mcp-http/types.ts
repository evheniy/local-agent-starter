import type { IncomingMessage, ServerResponse } from 'node:http';

export type HttpHandler = (req: IncomingMessage, res: ServerResponse) => void | Promise<void>;

export type McpTransportLike = {
  close: () => Promise<void>;
  handleRequest: (req: IncomingMessage, res: ServerResponse, body?: unknown) => Promise<void>;
};

export type McpServerLike = {
  close: () => Promise<void>;
  connect: (transport: McpTransportLike) => Promise<void>;
};

export type CreateMcpServerType = () => McpServerLike;

export type CreateMcpTransportType = () => McpTransportLike;

export type ReadJsonBodyType = (req: IncomingMessage) => Promise<unknown>;

export type CreateMcpRequestHandlerOptions = {
  createServer?: CreateMcpServerType;
  createTransport?: CreateMcpTransportType;
  logger?: Pick<Console, 'error'>;
  readJsonBody?: ReadJsonBodyType;
};

export type CreateHttpHandlerOptions = {
  handleMcpRequest?: HttpHandler;
};
