import { describe, expect, it, jest } from '@jest/globals';
import type { APIGatewayProxyEvent } from '@vyriy/router';
import type { Context, ResponseStream } from '@vyriy/handler';

const streamServerMock = jest.fn();

jest.mock('@vyriy/server', () => ({
  streamServer: streamServerMock,
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
  setContentType: jest.Mock;
  write: jest.Mock;
};

const getResponseStream = (): MockResponseStream => ({
  end: jest.fn(),
  setContentType: jest.fn(),
  write: jest.fn(),
});

const getContext = () =>
  ({
    getRemainingTimeInMillis: () => 30000,
  }) as Context;

describe('workspaces/chat', () => {
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
