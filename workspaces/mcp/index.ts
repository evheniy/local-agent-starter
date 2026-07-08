import { createLogger } from '@vyriy/logger';

import { startHttpServer } from '@p/mcp-http';

const logger = createLogger();

void startHttpServer().catch((error: unknown) => {
  logger.error(error);
  process.exitCode = 1;
});
