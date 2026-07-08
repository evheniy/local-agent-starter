import { describe, expect, it, jest } from '@jest/globals';

import { processBufferedEvents } from './process-buffered-events.js';

describe('processBufferedEvents', () => {
  it('dispatches complete blocks and returns the incomplete remainder', () => {
    const handlers = {
      onDelta: jest.fn(),
      onDone: jest.fn(),
    };

    const remainder = processBufferedEvents(
      'event: answer_delta\ndata: {"text":"Hel"}\n\nevent: done\ndata: {"ok":true}\n\nevent: answer_delta',
      handlers,
    );

    expect(handlers.onDelta).toHaveBeenCalledWith('Hel');
    expect(handlers.onDone).toHaveBeenCalledTimes(1);
    expect(remainder).toBe('event: answer_delta');
  });
});
