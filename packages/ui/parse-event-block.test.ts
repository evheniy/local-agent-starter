import { describe, expect, it } from '@jest/globals';

import { parseEventBlock } from './parse-event-block.js';

describe('parseEventBlock', () => {
  it('parses SSE event and data lines', () => {
    expect(parseEventBlock('event: answer_delta\ndata: {"text":"Hi"}')).toEqual({
      event: 'answer_delta',
      data: {
        text: 'Hi',
      },
    });
  });

  it('joins multiple data lines and ignores incomplete blocks', () => {
    expect(parseEventBlock('event: answer_delta\ndata: {"text":\ndata: "Hi"}')).toEqual({
      event: 'answer_delta',
      data: {
        text: 'Hi',
      },
    });
    expect(parseEventBlock('data: {"text":"Hi"}')).toBeUndefined();
    expect(parseEventBlock('event: done')).toBeUndefined();
  });
});
