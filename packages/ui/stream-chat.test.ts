import { ReadableStream } from 'node:stream/web';

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { streamChat } from './stream-chat.js';

const encoder = new TextEncoder();

const createBody = (chunks: string[]): ReadableStream<Uint8Array> =>
  new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }

      controller.close();
    },
  });

const createResponse = ({
  body = createBody([]),
  json = {},
  ok = true,
  status = 200,
  text = '',
}: {
  body?: ReadableStream<Uint8Array> | null;
  json?: unknown;
  ok?: boolean;
  status?: number;
  text?: string;
} = {}) =>
  ({
    body,
    json: jest.fn(() => Promise.resolve(json)),
    ok,
    status,
    text: jest.fn(() => Promise.resolve(text)),
  }) as unknown as Response;

describe('streamChat', () => {
  const previousApi = process.env.API;
  const previousChat = process.env.CHAT;

  beforeEach(() => {
    process.env.API = 'http://localhost:3000';
    process.env.CHAT = 'http://localhost:3002';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'fetch');

    if (previousApi === undefined) {
      delete process.env.API;
    } else {
      process.env.API = previousApi;
    }

    if (previousChat === undefined) {
      delete process.env.CHAT;
    } else {
      process.env.CHAT = previousChat;
    }
  });

  it('streams chat with the default limit', async () => {
    const onDone = jest.fn();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: createBody(['event: done\ndata: {"ok":true}\n\n']),
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChat({ message: 'What?', handlers: { onDone } });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3002/chat/stream',
      expect.objectContaining({
        body: JSON.stringify({
          message: 'What?',
          limit: 5,
        }),
      }),
    );
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('falls back to JSON chat when streaming is unavailable', async () => {
    const onDelta = jest.fn();
    const onDone = jest.fn();
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ ok: false, status: 404, text: 'missing stream' }))
      .mockResolvedValueOnce(createResponse({ json: { answer: 'Fallback answer.' } }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChat({
      message: 'What?',
      limit: 4,
      handlers: {
        onDelta,
        onDone,
      },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:3000/chat', expect.any(Object));
    expect(onDelta).toHaveBeenCalledWith('Fallback answer.');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('throws abort errors without falling back', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue(new DOMException('aborted', 'AbortError'));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(streamChat({ message: 'What?', handlers: {} })).rejects.toThrow('aborted');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
