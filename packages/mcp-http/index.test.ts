import { describe, expect, it, jest } from '@jest/globals';

jest.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: jest.fn(),
}));

describe('mcp-http public API', () => {
  it('exports MCP HTTP helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.HTTP_HEADERS).toBeDefined();
    expect(publicApi.HEALTHCHECK_BODY).toBeDefined();
    expect(publicApi.MCP_PATH).toBe('/mcp');
    expect(publicApi.createHttpHandler).toBeDefined();
    expect(publicApi.createMcpRequestHandler).toBeDefined();
    expect(publicApi.json).toBeDefined();
    expect(publicApi.jsonRpcError).toBeDefined();
    expect(publicApi.readJsonBody).toBeDefined();
    expect(publicApi.startHttpServer).toBeDefined();
  });
});
