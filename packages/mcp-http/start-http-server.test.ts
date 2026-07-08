import { describe, expect, it, jest } from '@jest/globals';

import type { HttpHandler } from '@vyriy/server';

const onceMock = jest.fn();
const addressMock = jest.fn(() => ({ port: 3003 }));
const httpServerMock = jest.fn<(_handler: HttpHandler) => unknown>(() => ({
  address: addressMock,
  listening: true,
  once: onceMock,
}));

jest.mock('./create-http-handler.js', () => ({
  createHttpHandler: jest.fn(),
}));

jest.mock('@vyriy/server', () => ({
  httpServer: httpServerMock,
}));

describe('startHttpServer', () => {
  it('starts the HTTP server', async () => {
    const { startHttpServer } = await import('./start-http-server.js');
    const handler = jest.fn() as HttpHandler;
    const createHandler = jest.fn(() => handler);

    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(startHttpServer(createHandler)).resolves.toEqual(
      expect.objectContaining({
        listening: true,
      }),
    );

    expect(httpServerMock).toHaveBeenCalledWith(handler);
    expect(console.warn).toHaveBeenCalledWith('Local Agent MCP HTTP server listening on http://localhost:3003/mcp');
  });

  it('waits for the HTTP server listening event', async () => {
    const { startHttpServer } = await import('./start-http-server.js');
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

    httpServerMock.mockReturnValueOnce(server);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const started = startHttpServer(() => jest.fn() as HttpHandler);

    listeningHandler?.();

    await expect(started).resolves.toBe(server);
    expect(server.once).toHaveBeenCalledWith('error', expect.any(Function));
    expect(server.once).toHaveBeenCalledWith('listening', expect.any(Function));
  });
});
