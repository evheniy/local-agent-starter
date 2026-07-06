import { startHttpServer } from './server.js';

void startHttpServer().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
