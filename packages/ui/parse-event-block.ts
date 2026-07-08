import type { StreamEvent } from './types.js';

export const parseEventBlock = (block: string): StreamEvent | undefined => {
  const lines = block.split(/\r?\n/u);
  const event = lines
    .find((line) => line.startsWith('event:'))
    ?.slice('event:'.length)
    .trim();
  const dataText = lines
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trimStart())
    .join('\n');

  if (!event || !dataText) {
    return undefined;
  }

  return {
    event,
    data: JSON.parse(dataText) as unknown,
  };
};
