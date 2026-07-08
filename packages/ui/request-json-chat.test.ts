import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { requestJsonChat } from './request-json-chat.js';

const createResponse = ({
  json = {},
  ok = true,
  status = 200,
}: {
  json?: unknown;
  ok?: boolean;
  status?: number;
} = {}) =>
  ({
    json: jest.fn(() => Promise.resolve(json)),
    ok,
    status,
  }) as unknown as Response;

describe('requestJsonChat', () => {
  const previousApi = process.env.API;

  beforeEach(() => {
    process.env.API = 'http://localhost:3000';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'fetch');

    if (previousApi === undefined) {
      delete process.env.API;
    } else {
      process.env.API = previousApi;
    }
  });

  it('posts a JSON chat request and dispatches response content', async () => {
    const onSources = jest.fn();
    const onDelta = jest.fn();
    const onDone = jest.fn();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        json: {
          answer: 'Fallback answer.',
          sources: [{ documentTitle: 'README.md', score: 0.91 }],
        },
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await requestJsonChat({
      message: 'What?',
      limit: 4,
      handlers: {
        onSources,
        onDelta,
        onDone,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/chat', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What?',
        limit: 4,
      }),
      signal: undefined,
    });
    expect(onSources).toHaveBeenCalledWith([{ documentTitle: 'README.md', score: 0.91 }]);
    expect(onDelta).toHaveBeenCalledWith('Fallback answer.');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('throws API errors from JSON responses', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ json: { error: 'LLM offline.' }, ok: false, status: 500 }))
      .mockResolvedValueOnce(createResponse({ json: { ok: false }, ok: false, status: 503 }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(requestJsonChat({ message: 'What?', handlers: {} })).rejects.toThrow('LLM offline.');
    await expect(requestJsonChat({ message: 'What?', handlers: {} })).rejects.toThrow(
      'Chat request failed with status 503',
    );
  });
});
