import { describe, expect, it, jest } from '@jest/globals';

const registerToolMock = jest.fn();

jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn().mockImplementation((options) => ({
    options,
    registerTool: registerToolMock,
  })),
}));

describe('createMcpServer', () => {
  it('creates a server and registers the ping tool', async () => {
    const { createMcpServer } = await import('./mcp.js');

    const server = createMcpServer();
    const [[name, definition, callback]] = registerToolMock.mock.calls as Array<
      [
        string,
        {
          description: string;
          inputSchema: Record<string, never>;
        },
        (args: unknown) => unknown,
      ]
    >;

    expect(server).toMatchObject({
      options: {
        name: 'local-agent-mcp',
        version: '0.0.0',
      },
    });
    expect(name).toBe('ping');
    expect(definition).toEqual({
      description: 'Check that the local MCP server is alive.',
      inputSchema: {},
    });
    expect(callback({})).toEqual({
      content: [
        {
          type: 'text',
          text: 'pong',
        },
      ],
    });
  });
});
