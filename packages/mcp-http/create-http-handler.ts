import { create } from '@vyriy/handler';
import { createHttpRouter } from '@vyriy/router';

import { HEALTHCHECK_BODY, HTTP_HEADERS, MCP_PATH } from './constants.js';
import { createMcpRequestHandler } from './create-mcp-request-handler.js';
import { json } from './json.js';

import type { CreateHttpHandlerOptions } from './types.js';

export const createHttpHandler = ({ handleMcpRequest = createMcpRequestHandler() }: CreateHttpHandlerOptions = {}) => {
  const router = createHttpRouter();

  router.all(MCP_PATH, handleMcpRequest);

  router.fallback((_req, res) => {
    json(res, 404, {
      message: 'Not found.',
    });
  });

  return create.httpApi({
    headers: HTTP_HEADERS,
    healthcheck: {
      body: HEALTHCHECK_BODY,
    },
  })(router.handle());
};
