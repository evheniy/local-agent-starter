import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { APIGatewayProxyEvent } from '@vyriy/router';
import type { Context, ResponseStream } from '@vyriy/handler';

const streamServerMock = jest.fn();
const streamRagChatMock = jest.fn();

jest.mock('@vyriy/server', () => ({
  streamServer: streamServerMock,
}));

jest.mock('@p/services', () => ({
  streamRagChat: streamRagChatMock,
}));

const getEvent = (path: string, method = 'GET', body: string | null = null): APIGatewayProxyEvent =>
  ({
    body,
    headers: {},
    httpMethod: method,
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path,
    pathParameters: null,
    queryStringParameters: {},
    requestContext: {},
    resource: path,
    stageVariables: null,
  }) as unknown as APIGatewayProxyEvent;

type MockResponseStream = ResponseStream & {
  end: jest.Mock;
  setHeader?: jest.Mock;
  setContentType: jest.Mock;
  write: jest.Mock;
};

const getResponseStream = (writableEnded?: boolean, headers = false): MockResponseStream => ({
  end: jest.fn(),
  setHeader: headers ? jest.fn() : undefined,
  setContentType: jest.fn(),
  write: jest.fn(),
  writableEnded,
});

const getContext = () =>
  ({
    getRemainingTimeInMillis: () => 30000,
  }) as Context;

describe('workspaces/chat', () => {
  beforeEach(() => {
    streamRagChatMock.mockReset();
  });

  it('starts the stream server on import', async () => {
    await jest.isolateModulesAsync(async () => {
      await import('./index.js');
    });

    expect(streamServerMock).toHaveBeenCalledTimes(1);
  });

  it('streams chat events as server-sent events', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream();

    await createChatHandler()(
      getEvent('/chat', 'POST', JSON.stringify({ message: 'ping' })),
      responseStream,
      getContext(),
    );

    expect(responseStream.setContentType).toHaveBeenCalledWith('text/event-stream; charset=utf-8');
    expect(responseStream.write).toHaveBeenCalledWith('event: thinking\n');
    expect(responseStream.write).toHaveBeenCalledWith('data: {"type":"final","text":"Echo: ping"}\n\n');
    expect(responseStream.end).toHaveBeenCalledWith();
  });

  it('streams RAG chat events as server-sent events', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream(undefined, true);

    streamRagChatMock.mockImplementation(async function* () {
      await Promise.resolve();
      yield {
        type: 'sources',
        sources: [
          {
            documentTitle: 'README.md',
            path: 'docs/README.md',
            chunkIndex: 0,
            score: 0.82,
            contentPreview: 'Relevant source.',
          },
        ],
      };
      yield {
        type: 'answer_delta',
        text: 'Hello',
      };
      yield {
        type: 'answer_delta',
        text: ' world',
      };
      yield {
        type: 'done',
        ok: true,
      };
    });

    await createChatHandler()(
      getEvent('/chat/stream', 'POST', JSON.stringify({ message: ' RAG? ', limit: 3 })),
      responseStream,
      getContext(),
    );

    expect(responseStream.setContentType).toHaveBeenCalledWith('text/event-stream; charset=utf-8');
    expect(responseStream.setHeader).toHaveBeenCalledWith('access-control-allow-origin', '*');
    expect(responseStream.setHeader).toHaveBeenCalledWith('access-control-allow-methods', 'GET, POST, OPTIONS');
    expect(responseStream.setHeader).toHaveBeenCalledWith('access-control-allow-headers', 'accept, content-type');
    expect(streamRagChatMock).toHaveBeenCalledWith({
      message: 'RAG?',
      limit: 3,
    });
    expect(responseStream.write).toHaveBeenNthCalledWith(
      1,
      'event: sources\ndata: {"sources":[{"documentTitle":"README.md","path":"docs/README.md","chunkIndex":0,"score":0.82,"contentPreview":"Relevant source."}]}\n\n',
    );
    expect(responseStream.write).toHaveBeenNthCalledWith(2, 'event: answer_delta\ndata: {"text":"Hello"}\n\n');
    expect(responseStream.write).toHaveBeenNthCalledWith(3, 'event: answer_delta\ndata: {"text":" world"}\n\n');
    expect(responseStream.write).toHaveBeenNthCalledWith(4, 'event: done\ndata: {"ok":true}\n\n');
    expect(responseStream.end).toHaveBeenCalledWith();
  });

  it('handles RAG stream CORS preflight requests', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream(undefined, true);

    await createChatHandler()(getEvent('/chat/stream', 'OPTIONS'), responseStream, getContext());

    expect(responseStream.setHeader).toHaveBeenCalledWith('access-control-allow-origin', '*');
    expect(responseStream.setHeader).toHaveBeenCalledWith('access-control-allow-methods', 'GET, POST, OPTIONS');
    expect(responseStream.setHeader).toHaveBeenCalledWith('access-control-allow-headers', 'accept, content-type');
    expect(responseStream.end).toHaveBeenCalledWith();
    expect(streamRagChatMock).not.toHaveBeenCalled();
  });

  it('returns method errors for non-POST RAG stream requests', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream();

    await createChatHandler()(getEvent('/chat/stream', 'GET'), responseStream, getContext());

    expect(responseStream.setContentType).toHaveBeenCalledWith('application/json; charset=utf-8');
    expect(responseStream.end).toHaveBeenCalledWith(
      JSON.stringify({
        message: 'Method Not Allowed',
      }),
    );
  });

  it('returns JSON validation errors before starting the RAG stream', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream();

    await createChatHandler()(
      getEvent('/chat/stream', 'POST', JSON.stringify({ message: '   ' })),
      responseStream,
      getContext(),
    );

    expect(responseStream.setContentType).toHaveBeenCalledWith('application/json; charset=utf-8');
    expect(responseStream.end).toHaveBeenCalledWith(
      JSON.stringify({
        ok: false,
        error: 'message is required.',
      }),
    );
    expect(streamRagChatMock).not.toHaveBeenCalled();
  });

  it('streams runtime errors after the RAG stream starts', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream();

    streamRagChatMock.mockImplementation(async function* () {
      await Promise.resolve();
      yield {
        type: 'sources',
        sources: [],
      };
      throw new Error('LLM offline.');
    });

    await createChatHandler()(
      getEvent('/chat/stream', 'POST', JSON.stringify({ message: 'RAG?' })),
      responseStream,
      getContext(),
    );

    expect(responseStream.write).toHaveBeenCalledWith('event: sources\ndata: {"sources":[]}\n\n');
    expect(responseStream.write).toHaveBeenCalledWith('event: error\ndata: {"ok":false,"error":"LLM offline."}\n\n');
    expect(responseStream.end).toHaveBeenCalledWith();
  });

  it('streams generic runtime errors for non-error failures', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream();

    streamRagChatMock.mockImplementation(async function* () {
      const shouldThrow = true;

      await Promise.resolve();
      if (shouldThrow) {
        throw Object.assign(Object.create(null), { reason: 'offline' });
      }

      yield {
        type: 'done',
        ok: true,
      };
    });

    await createChatHandler()(
      getEvent('/chat/stream', 'POST', JSON.stringify({ message: 'RAG?' })),
      responseStream,
      getContext(),
    );

    expect(responseStream.write).toHaveBeenCalledWith(
      'event: error\ndata: {"ok":false,"error":"Streaming chat request failed."}\n\n',
    );
    expect(responseStream.end).toHaveBeenCalledWith();
  });

  it('stops writing RAG stream events after the response ends', async () => {
    const { createChatHandler } = await import('./index.js');
    const responseStream = getResponseStream(true);

    streamRagChatMock.mockImplementation(async function* () {
      await Promise.resolve();
      yield {
        type: 'sources',
        sources: [],
      };
    });

    await createChatHandler()(
      getEvent('/chat/stream', 'POST', JSON.stringify({ message: 'RAG?' })),
      responseStream,
      getContext(),
    );

    expect(responseStream.write).not.toHaveBeenCalled();
    expect(responseStream.end).not.toHaveBeenCalled();
  });

  it('supports string and empty chat request bodies', async () => {
    const { createChatHandler } = await import('./index.js');
    const stringResponse = getResponseStream();
    const emptyResponse = getResponseStream();

    await createChatHandler()(getEvent('/chat', 'POST', '"hello"'), stringResponse, getContext());
    await createChatHandler()(getEvent('/chat', 'POST'), emptyResponse, getContext());

    expect(stringResponse.write).toHaveBeenCalledWith('data: {"type":"final","text":"Echo: hello"}\n\n');
    expect(emptyResponse.write).toHaveBeenCalledWith(
      'data: {"type":"final","text":"Echo: Hello from Local Agent Chat"}\n\n',
    );
  });

  it('falls back to the default chat request for primitive JSON bodies', async () => {
    const { createChatHandler } = await import('./index.js');
    const response = getResponseStream();

    await createChatHandler()(getEvent('/chat', 'POST', '1'), response, getContext());

    expect(response.write).toHaveBeenCalledWith(
      'data: {"type":"final","text":"Echo: Hello from Local Agent Chat"}\n\n',
    );
  });

  it('responds to healthcheck and fallback routes', async () => {
    const { createChatHandler } = await import('./index.js');
    const healthResponse = getResponseStream();
    const missingResponse = getResponseStream();

    await createChatHandler()(getEvent('/healthcheck'), healthResponse, getContext());
    await createChatHandler()(getEvent('/missing'), missingResponse, getContext());

    expect(healthResponse.end).toHaveBeenCalledWith(
      JSON.stringify({
        ok: true,
        name: 'local-agent-chat',
        transport: 'server-sent-events',
      }),
    );
    expect(missingResponse.end).toHaveBeenCalledWith(
      JSON.stringify({
        message: 'Not Found',
      }),
    );
  });
});
