import type { z } from 'zod';
import type { ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { askDocumentsTool } from './ask-documents.js';
import { listDocumentsTool } from './list-documents.js';
import { pingTool } from './ping.js';
import { searchDocumentsTool } from './search-documents.js';
import type { ToolDefinition } from './types.js';

const registerTool = <Input extends z.ZodRawShape>(server: McpServer, tool: ToolDefinition<Input>) => {
  const callback = ((args: unknown) => tool.handler(args as z.infer<z.ZodObject<Input>>)) as ToolCallback<Input>;

  server.registerTool(
    tool.name,
    {
      description: tool.description,
      inputSchema: tool.inputSchema,
    },
    callback,
  );
};

export const createMcpServer = () => {
  const server = new McpServer({
    name: 'local-agent-mcp',
    version: '0.0.0',
  });

  registerTool(server, pingTool);
  registerTool(server, listDocumentsTool);
  registerTool(server, searchDocumentsTool);
  registerTool(server, askDocumentsTool);

  return server;
};
