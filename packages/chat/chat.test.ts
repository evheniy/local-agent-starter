import { describe, expect, it } from '@jest/globals';

import { createChatResponse, runChat } from './chat.js';

describe('chat runtime', () => {
  it('creates a response from a direct message', () => {
    expect(createChatResponse({ message: 'ping' })).toBe('Echo: ping');
  });

  it('creates a response from the last user message or the default message', () => {
    expect(
      createChatResponse({
        messages: [
          { role: 'user', content: 'first' },
          { role: 'assistant', content: 'middle' },
          { role: 'user', content: ' last ' },
        ],
      }),
    ).toBe('Echo: last');
    expect(
      createChatResponse({
        messages: [{ role: 'assistant', content: 'assistant only' }],
      }),
    ).toBe('Echo: Hello from Local Agent Chat');
  });

  it('streams thinking, delta, and final events', async () => {
    const events = [];

    for await (const event of runChat({ message: 'stream me' })) {
      events.push(event);
    }

    expect(events[0]).toEqual({
      type: 'thinking',
      text: 'Preparing chat response...',
    });
    expect(events).toContainEqual({
      type: 'delta',
      text: 'Echo:',
    });
    expect(events.at(-1)).toEqual({
      type: 'final',
      text: 'Echo: stream me',
    });
  });
});
