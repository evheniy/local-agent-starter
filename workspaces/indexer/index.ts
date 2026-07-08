import { getIndexerPollMs, isTest } from '@p/env';
import { processNextIndexJob } from '@p/services';

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

export const createIndexerLoop =
  ({
    pollMs = getIndexerPollMs(),
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
if (!isTest()) {
  void startIndexer();
}
