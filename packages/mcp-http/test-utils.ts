import type { IncomingMessage, ServerResponse } from 'node:http';
import { jest } from '@jest/globals';

export type MockServerResponse = ServerResponse & {
  endMock: jest.Mock;
  writeHeadMock: jest.Mock;
};

export const getResponse = (headersSent = false) => {
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

export const getRequest = (method = 'GET') =>
  ({
    method,
    url: '/mcp',
  }) as IncomingMessage;
