import { describe, expect, it } from '@jest/globals';

import { pingTool } from './ping.js';

describe('pingTool', () => {
  it('returns pong', () => {
    expect(pingTool.handler()).toEqual({
      content: [
        {
          type: 'text',
          text: 'pong',
        },
      ],
    });
  });
});
