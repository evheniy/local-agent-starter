import { processNextIndexJob } from '@p/services';

const DEFAULT_POLL_MS = 5000;

export type IndexerLoopOptions = {
  pollMs?: number;
  processNext?: typeof processNextIndexJob;
  sleep?: (ms: number) => Promise<void>;
  shouldContinue?: () => boolean;
  logger?: Pick<Console, 'error' | 'log'>;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const getPollMs = () => Number(process.env.INDEXER_POLL_MS ?? DEFAULT_POLL_MS);

export const createIndexerLoop =
  ({
    pollMs = getPollMs(),
    processNext = processNextIndexJob,
    sleep: wait = sleep,
    shouldContinue = () => true,
    logger = console,
  }: IndexerLoopOptions = {}) =>
  async () => {
    logger.log(`Local Agent Indexer worker polling every ${pollMs}ms`);

    while (shouldContinue()) {
      try {
        const result = await processNext();

        if (!result.indexed) {
          await wait(pollMs);
        }
      } catch (error) {
        logger.error(error);
        await wait(pollMs);
      }
    }
  };

export const startIndexer = (options?: IndexerLoopOptions) => createIndexerLoop(options)();

/* istanbul ignore if -- runtime entrypoint */
/* c8 ignore next 3 -- runtime entrypoint */
if (process.env.NODE_ENV !== 'test') {
  void startIndexer();
}
