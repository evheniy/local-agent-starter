export const HTTP_HEADERS = {
  'access-control-allow-headers': 'content-type, mcp-protocol-version',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-origin': '*',
  'x-content-type-options': 'nosniff',
};

export const HEALTHCHECK_BODY = {
  ok: true,
  name: 'local-agent-mcp',
  transport: 'streamable-http',
};

export const MCP_PATH = '/mcp';
