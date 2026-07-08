import type { AddressInfo } from 'node:net';

import { httpServer } from '@vyriy/server';
import { createHttpHandler } from './create-http-handler.js';

import type { Server } from 'node:http';
import type { HttpHandler } from '@vyriy/server';

const waitForListening = async (server: Server) => {
  await new Promise<void>((resolve, reject) => {
    if (server.listening) {
      resolve();
      return;
    }

    server.once('error', reject);
    server.once('listening', resolve);
  });
};

export const startHttpServer = async (createHandler: () => HttpHandler = createHttpHandler) => {
  const server = httpServer(createHandler());

  await waitForListening(server);

  const address = server.address() as AddressInfo;

  console.warn(`Local Agent MCP HTTP server listening on http://localhost:${address.port}/mcp`);

  return server;
};
