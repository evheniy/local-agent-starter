import { ReadableStream } from 'node:stream/web';

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { streamChat } from './chat-stream.js';

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
  let previousApi: string | undefined;
  let previousChat: string | undefined;

  beforeEach(() => {
    previousApi = process.env.API;
    previousChat = process.env.CHAT;
    process.env.CHAT = 'http://localhost:3002';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'fetch');

    if (previousChat === undefined) {
      delete process.env.CHAT;
    } else {
      process.env.CHAT = previousChat;
    }

    if (previousApi === undefined) {
      delete process.env.API;
    } else {
      process.env.API = previousApi;
    }
  });

  it('parses sources, answer deltas, and done events', async () => {
    const onSources = jest.fn();
    const onDelta = jest.fn();
    const onDone = jest.fn();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: createBody([
          'event: sources\ndata: {"sources":[{"documentTitle":"README.md","score":0.82}]}\n\n',
          'event: answer_delta\ndata: {"text":"Hel"}\n\n',
          'event: answer_delta\ndata: {"text":"lo"}\n\n',
          'event: done\ndata: {"ok":true}\n\n',
        ]),
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChat({
      message: 'What?',
      limit: 3,
      handlers: {
        onSources,
        onDelta,
        onDone,
      },
    });

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3002/chat/stream', {
      method: 'POST',
      headers: {
        accept: 'text/event-stream',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        message: 'What?',
        limit: 3,
      }),
      signal: undefined,
    });
    expect(onSources).toHaveBeenCalledWith([
      {
        documentTitle: 'README.md',
        score: 0.82,
      },
    ]);
    expect(onDelta).toHaveBeenNthCalledWith(1, 'Hel');
    expect(onDelta).toHaveBeenNthCalledWith(2, 'lo');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('uses API and browser origin fallback base URLs', async () => {
    delete process.env.CHAT;
    process.env.API = 'http://localhost:3000';
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        createResponse({
          body: createBody(['event: done\ndata: {"ok":true}\n\n']),
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          body: createBody(['event: done\ndata: {"ok":true}\n\n']),
        }),
      );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChat({ message: 'What?', handlers: {} });
    delete process.env.API;
    await streamChat({ message: 'What?', handlers: {} });

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3000/chat/stream', expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost/chat/stream', expect.any(Object));
  });

  it('handles stream error events', async () => {
    const onError = jest.fn();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: createBody(['event: error\ndata: {"ok":false,"error":"LLM offline."}\n\n']),
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChat({
      message: 'What?',
      handlers: {
        onError,
      },
    });

    expect(onError).toHaveBeenCalledWith('LLM offline.');
  });

  it('handles fallback error events and final buffered events', async () => {
    const onError = jest.fn();
    const onDelta = jest.fn();
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(
        createResponse({
          body: createBody(['event: error\ndata: {"ok":false}\n\n']),
        }),
      )
      .mockResolvedValueOnce(
        createResponse({
          body: createBody(['event: answer_delta\ndata: {"text":"tail"}']),
        }),
      );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChat({
      message: 'What?',
      handlers: {
        onError,
      },
    });
    await streamChat({
      message: 'What?',
      handlers: {
        onDelta,
      },
    });

    expect(onError).toHaveBeenCalledWith('Stream failed.');
    expect(onDelta).toHaveBeenCalledWith('tail');
  });

  it('falls back to the API JSON chat endpoint when streaming is unavailable', async () => {
    process.env.API = 'http://localhost:3000';
    const onSources = jest.fn();
    const onDelta = jest.fn();
    const onDone = jest.fn();
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ ok: false, status: 404, text: 'missing stream' }))
      .mockResolvedValueOnce(
        createResponse({
          json: {
            ok: true,
            answer: 'Fallback answer.',
            sources: [
              {
                documentTitle: 'README.md',
                score: 0.91,
              },
            ],
          },
        }),
      );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChat({
      message: 'What?',
      limit: 4,
      handlers: {
        onSources,
        onDelta,
        onDone,
      },
    });

    expect(fetchMock).toHaveBeenNthCalledWith(1, 'http://localhost:3002/chat/stream', expect.any(Object));
    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://localhost:3000/chat', {
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
    expect(onSources).toHaveBeenCalledWith([
      {
        documentTitle: 'README.md',
        score: 0.91,
      },
    ]);
    expect(onDelta).toHaveBeenCalledWith('Fallback answer.');
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('throws fallback API errors', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ body: null }))
      .mockResolvedValueOnce(
        createResponse({
          json: {
            ok: false,
            error: 'LLM offline.',
          },
          ok: false,
          status: 500,
        }),
      )
      .mockResolvedValueOnce(createResponse({ body: null }))
      .mockResolvedValueOnce(
        createResponse({
          json: {
            ok: false,
          },
          ok: false,
          status: 503,
        }),
      );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(streamChat({ message: 'What?', handlers: {} })).rejects.toThrow('LLM offline.');
    await expect(streamChat({ message: 'What?', handlers: {} })).rejects.toThrow('Chat request failed with status 503');
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

  it('throws network and missing body errors when fallback also fails', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ ok: false, status: 500, text: 'offline' }))
      .mockRejectedValueOnce(new TypeError('api offline'))
      .mockResolvedValueOnce(createResponse({ ok: false, status: 503, text: '' }))
      .mockRejectedValueOnce(new TypeError('api offline'))
      .mockResolvedValueOnce(createResponse({ body: null }))
      .mockRejectedValueOnce(new TypeError('api offline'));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(streamChat({ message: 'What?', handlers: {} })).rejects.toThrow('api offline');
    await expect(streamChat({ message: 'What?', handlers: {} })).rejects.toThrow('api offline');
    await expect(streamChat({ message: 'What?', handlers: {} })).rejects.toThrow('api offline');
  });
});
