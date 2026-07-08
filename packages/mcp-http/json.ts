import type { ServerResponse } from 'node:http';

export const json = (res: ServerResponse, statusCode: number, body: unknown) => {
  res.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};
