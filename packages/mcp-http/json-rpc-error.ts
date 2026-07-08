import { json } from './json.js';

import type { ServerResponse } from 'node:http';

export const jsonRpcError = (res: ServerResponse, statusCode: number, code: number, message: string) =>
  json(res, statusCode, {
    jsonrpc: '2.0',
    error: { code, message },
    id: null,
  });
