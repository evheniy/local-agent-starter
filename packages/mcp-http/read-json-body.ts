import { getBody } from '@vyriy/server/body';

import type { IncomingMessage } from 'node:http';

export const readJsonBody = async (req: IncomingMessage) => {
  const body = (await getBody(req))?.trim();

  return body ? (JSON.parse(body) as unknown) : undefined;
};
