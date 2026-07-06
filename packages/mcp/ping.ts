import type { ToolDefinition } from './types.js';

export const pingTool = {
  name: 'ping',
  description: 'Check that the local MCP server is alive.',
  inputSchema: {},
  handler: () => ({
    content: [
      {
        type: 'text',
        text: 'pong',
      },
    ],
  }),
} satisfies ToolDefinition<Record<string, never>>;
