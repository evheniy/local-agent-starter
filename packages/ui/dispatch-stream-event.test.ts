import { describe, expect, it, jest } from '@jest/globals';

import { dispatchStreamEvent } from './dispatch-stream-event.js';

describe('dispatchStreamEvent', () => {
  it('dispatches known stream events to handlers', () => {
    const handlers = {
      onSources: jest.fn(),
      onDelta: jest.fn(),
      onDone: jest.fn(),
      onError: jest.fn(),
    };

    dispatchStreamEvent({ event: 'sources', data: { sources: [{ documentTitle: 'README.md' }] } }, handlers);
    dispatchStreamEvent({ event: 'answer_delta', data: { text: 'Hello' } }, handlers);
    dispatchStreamEvent({ event: 'done', data: { ok: true } }, handlers);
    dispatchStreamEvent({ event: 'error', data: { error: 'LLM offline.' } }, handlers);

    expect(handlers.onSources).toHaveBeenCalledWith([{ documentTitle: 'README.md' }]);
    expect(handlers.onDelta).toHaveBeenCalledWith('Hello');
    expect(handlers.onDone).toHaveBeenCalledTimes(1);
    expect(handlers.onError).toHaveBeenCalledWith('LLM offline.');
  });

  it('ignores invalid payloads and uses generic stream errors', () => {
    const handlers = {
      onSources: jest.fn(),
      onDelta: jest.fn(),
      onError: jest.fn(),
    };

    dispatchStreamEvent({ event: 'sources', data: { sources: 'bad' } }, handlers);
    dispatchStreamEvent({ event: 'answer_delta', data: { text: 1 } }, handlers);
    dispatchStreamEvent({ event: 'unknown', data: {} }, handlers);
    dispatchStreamEvent({ event: 'error', data: { ok: false } }, handlers);

    expect(handlers.onSources).not.toHaveBeenCalled();
    expect(handlers.onDelta).not.toHaveBeenCalled();
    expect(handlers.onError).toHaveBeenCalledWith('Stream failed.');
  });
});
