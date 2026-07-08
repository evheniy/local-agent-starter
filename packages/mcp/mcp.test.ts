import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const registerToolMock = jest.fn();

jest.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: jest.fn().mockImplementation((options) => ({
    options,
    registerTool: registerToolMock,
  })),
}));

describe('createMcpServer', () => {
  beforeEach(() => {
    registerToolMock.mockClear();
  });

  it('creates a server and registers read-only tools', async () => {
    const { createMcpServer } = await import('./mcp.js');

    const server = createMcpServer();
    const calls = registerToolMock.mock.calls as Array<
      [
        string,
        {
          description: string;
          inputSchema: Record<string, unknown>;
        },
        (args: unknown) => unknown,
      ]
    >;
    const [name, definition, callback] = calls[0] ?? [];

    expect(server).toMatchObject({
      options: {
        name: 'local-agent-mcp',
        version: '0.0.0',
      },
    });
    expect(calls.map(([toolName]) => toolName)).toEqual([
      'ping',
      'list_documents',
      'search_documents',
      'ask_documents',
    ]);
    expect(calls.map(([toolName]) => toolName)).not.toEqual(
      expect.arrayContaining([
        'upload_document',
        'delete_document',
        'reindex_document',
        'write_file',
        'edit_file',
        'execute_command',
        'run_shell',
      ]),
    );
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
