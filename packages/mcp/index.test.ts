import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('mcp public API', () => {
  it('exports the MCP server factory and ping tool', () => {
    expect(publicApi.createMcpServer).toBeDefined();
    expect(publicApi.pingTool).toBeDefined();
  });
});
