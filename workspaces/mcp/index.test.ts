import { describe, expect, it, jest } from '@jest/globals';

const startHttpServerMock = jest.fn<() => Promise<void>>();
const loggerErrorMock = jest.fn();

jest.mock('@p/mcp-http', () => ({
  startHttpServer: startHttpServerMock,
}));

jest.mock('@vyriy/logger', () => ({
  createLogger: () => ({
    error: loggerErrorMock,
  }),
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

    startHttpServerMock.mockRejectedValue(error);

    await jest.isolateModulesAsync(async () => {
      await import('./index.js');
    });
    await Promise.resolve();

    expect(loggerErrorMock).toHaveBeenCalledWith(error);
    expect(process.exitCode).toBe(1);

    process.exitCode = previousExitCode;
  });
});
