import { ReadableStream } from 'node:stream/web';

import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { streamChatResponse } from './stream-chat-response.js';

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
  ok = true,
  status = 200,
  text = '',
}: {
  body?: ReadableStream<Uint8Array> | null;
  ok?: boolean;
  status?: number;
  text?: string;
} = {}) =>
  ({
    body,
    ok,
    status,
    text: jest.fn(() => Promise.resolve(text)),
  }) as unknown as Response;

describe('streamChatResponse', () => {
  const previousChat = process.env.CHAT;

  beforeEach(() => {
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
  });

  it('posts a chat stream request and dispatches streamed events', async () => {
    const onSources = jest.fn();
    const onDelta = jest.fn();
    const onDone = jest.fn();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: createBody([
          'event: sources\ndata: {"sources":[{"documentTitle":"README.md","score":0.82}]}\n\n',
          'event: answer_delta\ndata: {"text":"Hel"}\n\n',
          'event: answer_delta\ndata: {"text":"lo"}',
          '\n\nevent: done\ndata: {"ok":true}\n\n',
        ]),
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChatResponse({
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

  it('dispatches a final buffered event', async () => {
    const onDelta = jest.fn();
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: createBody(['event: answer_delta\ndata: {"text":"tail"}']),
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await streamChatResponse({
      message: 'What?',
      handlers: {
        onDelta,
      },
    });

    expect(onDelta).toHaveBeenCalledWith('tail');
  });

  it('throws response and missing body errors', async () => {
    const fetchMock = jest
      .fn<typeof fetch>()
      .mockResolvedValueOnce(createResponse({ ok: false, status: 500, text: 'offline' }))
      .mockResolvedValueOnce(createResponse({ ok: false, status: 503, text: '' }))
      .mockResolvedValueOnce(createResponse({ body: null }));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    await expect(streamChatResponse({ message: 'What?', handlers: {} })).rejects.toThrow('offline');
    await expect(streamChatResponse({ message: 'What?', handlers: {} })).rejects.toThrow(
      'Chat stream failed with status 503',
    );
    await expect(streamChatResponse({ message: 'What?', handlers: {} })).rejects.toThrow(
      'Chat stream response did not include a body.',
    );
  });
});
