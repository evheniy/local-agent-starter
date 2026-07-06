import { describe, expect, it, jest } from '@jest/globals';

const startHttpServerMock = jest.fn<() => Promise<void>>();

jest.mock('./server.js', () => ({
  startHttpServer: startHttpServerMock,
}));

describe('workspaces/mcp/index', () => {
  it('starts the MCP HTTP server', async () => {
    startHttpServerMock.mockResolvedValue(undefined);

    await jest.isolateModulesAsync(async () => {
      await import('./index.js');
    });

    expect(startHttpServerMock).toHaveBeenCalledTimes(1);
  });

  it('stores startup errors on process exitCode', async () => {
    const previousExitCode = process.exitCode;
    const error = new Error('boom');

    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    startHttpServerMock.mockRejectedValue(error);

    await jest.isolateModulesAsync(async () => {
      await import('./index.js');
    });
    await Promise.resolve();

    expect(console.error).toHaveBeenCalledWith(error);
    expect(process.exitCode).toBe(1);

    process.exitCode = previousExitCode;
  });
});
