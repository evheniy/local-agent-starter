import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('mcp public API', () => {
  it('exports the MCP server factory and tools', () => {
    expect(publicApi.askDocumentsTool).toBeDefined();
    expect(publicApi.createAskDocumentsTool).toBeDefined();
    expect(publicApi.createListDocumentsTool).toBeDefined();
    expect(publicApi.createMcpServer).toBeDefined();
    expect(publicApi.createSearchDocumentsTool).toBeDefined();
    expect(publicApi.jsonToolResult).toBeDefined();
    expect(publicApi.listDocumentsTool).toBeDefined();
    expect(publicApi.pingTool).toBeDefined();
    expect(publicApi.searchDocumentsTool).toBeDefined();
  });
});
