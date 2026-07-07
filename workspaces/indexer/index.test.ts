import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { createIndexerLoop, startIndexer } from './index.js';

describe('indexer workspace', () => {
  afterEach(() => {
    jest.useRealTimers();
    delete process.env.INDEXER_POLL_MS;
  });

  it('processes indexed jobs without sleeping', async () => {
    let runs = 0;
    const processNext = jest.fn(() => {
      runs += 1;

      return Promise.resolve({
        indexed: true,
      });
    });
    const wait = jest.fn((ms: number) => {
      void ms;

      return Promise.resolve();
    });
    const indexer = createIndexerLoop({
      pollMs: 10,
      processNext,
      sleep: wait,
      shouldContinue: () => runs < 1,
      logger: {
        error: jest.fn((input: unknown) => {
          void input;
        }),
        log: jest.fn(),
      },
    });

    await indexer();

    expect(processNext).toHaveBeenCalledTimes(1);
    expect(wait).not.toHaveBeenCalled();
  });

  it('sleeps when no job is indexed', async () => {
    let checks = 0;
    const wait = jest.fn((ms: number) => {
      void ms;

      return Promise.resolve();
    });
    const indexer = createIndexerLoop({
      pollMs: 10,
      processNext: jest.fn(() =>
        Promise.resolve({
          indexed: false,
        }),
      ),
      sleep: wait,
      shouldContinue: () => {
        checks += 1;

        return checks <= 1;
      },
      logger: {
        error: jest.fn((input: unknown) => {
          void input;
        }),
        log: jest.fn(),
      },
    });

    await indexer();

    expect(wait).toHaveBeenCalledWith(10);
  });

  it('logs and sleeps after worker errors', async () => {
    let checks = 0;
    const logger = {
      error: jest.fn((input: unknown) => {
        void input;
      }),
      log: jest.fn(),
    };
    const wait = jest.fn((ms: number) => {
      void ms;

      return Promise.resolve();
    });
    const error = new Error('database offline');
    const indexer = createIndexerLoop({
      pollMs: 10,
      processNext: jest.fn(() => Promise.reject(error)),
      sleep: wait,
      shouldContinue: () => {
        checks += 1;

        return checks <= 1;
      },
      logger,
    });

    await indexer();

    expect(logger.error).toHaveBeenCalledWith(error);
    expect(wait).toHaveBeenCalledWith(10);
  });

  it('uses the default sleep and poll interval from the environment', async () => {
    jest.useFakeTimers();
    process.env.INDEXER_POLL_MS = '25';

    let checks = 0;
    const indexer = createIndexerLoop({
      processNext: jest.fn(() =>
        Promise.resolve({
          indexed: false,
        }),
      ),
      shouldContinue: () => {
        checks += 1;

        return checks <= 1;
      },
      logger: {
        error: jest.fn((input: unknown) => {
          void input;
        }),
        log: jest.fn(),
      },
    });
    const run = indexer();

    await Promise.resolve();
    jest.advanceTimersByTime(25);
    await run;

    expect(checks).toBe(2);
  });

  it('uses the built-in poll interval when the environment is missing', async () => {
    jest.useFakeTimers();
    delete process.env.INDEXER_POLL_MS;

    let checks = 0;
    const indexer = createIndexerLoop({
      processNext: jest.fn(() =>
        Promise.resolve({
          indexed: false,
        }),
      ),
      shouldContinue: () => {
        checks += 1;

        return checks <= 1;
      },
      logger: {
        error: jest.fn((input: unknown) => {
          void input;
        }),
        log: jest.fn(),
      },
    });
    const run = indexer();

    await Promise.resolve();
    jest.advanceTimersByTime(5000);
    await run;

    expect(checks).toBe(2);
  });

  it('starts an indexer loop with supplied options', async () => {
    const processNext = jest.fn(() =>
      Promise.resolve({
        indexed: true,
      }),
    );
    const logger = {
      error: jest.fn((input: unknown) => {
        void input;
      }),
      log: jest.fn(),
    };

    await startIndexer({
      processNext,
      shouldContinue: () => false,
      logger,
    });

    expect(logger.log).toHaveBeenCalledWith('Local Agent Indexer worker polling every 5000ms');
    expect(processNext).not.toHaveBeenCalled();
  });

  it('uses the default continue predicate', async () => {
    const stop = new Error('stop');
    const indexer = createIndexerLoop({
      processNext: jest.fn(() => Promise.reject(new Error('database offline'))),
      sleep: jest.fn(() => Promise.reject(stop)),
      logger: {
        error: jest.fn((input: unknown) => {
          void input;
        }),
        log: jest.fn(),
      },
    });

    await expect(indexer()).rejects.toThrow(stop);
  });
});
