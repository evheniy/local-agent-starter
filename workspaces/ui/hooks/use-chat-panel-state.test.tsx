import { ReadableStream } from 'node:stream/web';

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import { useChatPanelState } from './use-chat-panel-state.js';

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

describe('useChatPanelState', () => {
  let previousChat: string | undefined;

  beforeEach(() => {
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
  });

  it('streams assistant messages and sources', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: createBody([
          'event: sources\ndata: {"sources":[{"documentTitle":"README.md","path":"docs/README.md","chunkIndex":0,"score":0.82,"contentPreview":"Relevant preview."}]}\n\n',
          'event: answer_delta\ndata: {"text":"Hello"}\n\n',
          'event: answer_delta\ndata: {"text":" world"}\n\n',
          'event: done\ndata: {"ok":true}\n\n',
        ]),
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() =>
      useChatPanelState({
        files: [
          {
            id: '1',
            name: 'notes.md',
            status: 'indexed',
          },
        ],
      }),
    );

    act(() => {
      result.current.setQuestion('  What is indexed?  ');
    });

    await act(async () => {
      await result.current.submitQuestion();
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3002/chat/stream',
      expect.objectContaining({
        body: JSON.stringify({
          message: 'What is indexed?',
          limit: 5,
        }),
      }),
    );
    expect(result.current.messages).toEqual([
      expect.objectContaining({
        role: 'user',
        content: 'What is indexed?',
      }),
      expect.objectContaining({
        role: 'assistant',
        content: 'Hello world',
        status: 'done',
        sources: [
          {
            documentTitle: 'README.md',
            path: 'docs/README.md',
            chunkIndex: 0,
            score: 0.82,
            contentPreview: 'Relevant preview.',
          },
        ],
      }),
    ]);
    expect(result.current.question).toBe('');
    expect(result.current.answer).toBe('Hello world');
    expect(result.current.isLoading).toBe(false);
  });

  it('does not submit empty questions', async () => {
    const fetchMock = jest.fn<typeof fetch>();

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useChatPanelState());

    act(() => {
      result.current.setQuestion('   ');
    });

    await act(async () => {
      await result.current.submitQuestion();
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.messages).toEqual([]);
  });

  it('stores stream errors on the assistant message', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockResolvedValue(
      createResponse({
        body: createBody(['event: error\ndata: {"ok":false,"error":"LLM offline."}\n\n']),
      }),
    );

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useChatPanelState());

    act(() => {
      result.current.setQuestion('What is indexed?');
    });

    await act(async () => {
      await result.current.submitQuestion();
    });

    expect(result.current.error).toBe('LLM offline.');
    expect(result.current.messages.at(-1)).toMatchObject({
      role: 'assistant',
      status: 'error',
      error: 'LLM offline.',
    });
  });

  it('stores thrown stream errors', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue(new DOMException('aborted', 'AbortError'));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useChatPanelState());

    act(() => {
      result.current.setQuestion('What is indexed?');
    });

    await act(async () => {
      await result.current.submitQuestion();
    });

    expect(result.current.error).toBe('Stream disconnected.');
    expect(result.current.messages.at(-1)).toMatchObject({
      status: 'error',
      error: 'Stream disconnected.',
    });
  });

  it('stores thrown Error stream messages', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue(new Error('Network offline.'));

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useChatPanelState());

    act(() => {
      result.current.setQuestion('What is indexed?');
    });

    await act(async () => {
      await result.current.submitQuestion();
    });

    expect(result.current.error).toBe('Network offline.');
    expect(result.current.messages.at(-1)).toMatchObject({
      status: 'error',
      error: 'Network offline.',
    });
  });

  it('uses a generic message for unknown thrown stream errors', async () => {
    const fetchMock = jest.fn<typeof fetch>().mockRejectedValue('boom');

    Object.defineProperty(globalThis, 'fetch', {
      configurable: true,
      value: fetchMock,
    });

    const { result } = renderHook(() => useChatPanelState());

    act(() => {
      result.current.setQuestion('What is indexed?');
    });

    await act(async () => {
      await result.current.submitQuestion();
    });

    expect(result.current.error).toBe('Chat failed.');
    expect(result.current.messages.at(-1)).toMatchObject({
      status: 'error',
      error: 'Chat failed.',
    });
  });

  it('reports indexed file availability', () => {
    const { result } = renderHook(() =>
      useChatPanelState({
        files: [
          {
            id: '1',
            name: 'notes.md',
            status: 'indexed',
          },
        ],
      }),
    );

    expect(result.current.hasIndexedFiles).toBe(true);
  });
});
