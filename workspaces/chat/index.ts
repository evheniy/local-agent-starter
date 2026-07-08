import { create } from '@vyriy/handler';
import { createRouter as createStreamRouter } from '@vyriy/router/stream';
import { streamServer } from '@vyriy/server';

import type { ChatRequest, ChatStreamEvent } from '@p/chat';
import { runChat } from '@p/chat';
import { streamRagChat } from '@p/services';

import { formatRagChatSseEvent } from './sse.js';
import { parseStreamChatRequest } from './stream-chat-request.js';

const CHAT_CORS_HEADERS = {
  'access-control-allow-headers': 'accept, content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-origin': '*',
};

type HeaderResponseStream = {
  setHeader?: (name: string, value: string) => unknown;
};

const setCorsHeaders = (responseStream: HeaderResponseStream) => {
  for (const [name, value] of Object.entries(CHAT_CORS_HEADERS)) {
    responseStream.setHeader?.(name, value);
  }
};

const parseChatRequest = (body?: string): ChatRequest => {
  if (!body?.trim()) {
    return {};
  }

  const parsed = JSON.parse(body) as unknown;

  if (typeof parsed === 'string') {
    return {
      message: parsed,
    };
  }

  if (parsed && typeof parsed === 'object') {
    return parsed;
  }

  return {};
};

const writeSse = (write: (chunk: string) => unknown, event: ChatStreamEvent) => {
  write(`event: ${event.type}\n`);
  write(`data: ${JSON.stringify(event)}\n\n`);
};

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Streaming chat request failed.');

const writeJsonError = (
  responseStream: { end: (chunk: string) => unknown; setContentType?: (contentType: string) => unknown },
  error: unknown,
) => {
  responseStream.setContentType?.('application/json; charset=utf-8');
  responseStream.end(
    JSON.stringify({
      ok: false,
      error: getErrorMessage(error),
    }),
  );
};

export const createChatHandler = () => {
  const router = createStreamRouter();

  router.all('/chat/stream', (_params, responseStream) => {
    responseStream.setContentType?.('application/json; charset=utf-8');
    responseStream.end(
      JSON.stringify({
        message: 'Method Not Allowed',
      }),
    );
  });

  router.post('/chat/stream', async ({ body }, responseStream) => {
    let request;

    try {
      request = parseStreamChatRequest(body);
    } catch (error) {
      writeJsonError(responseStream, error);
      return;
    }

    responseStream.setContentType?.('text/event-stream; charset=utf-8');

    try {
      for await (const event of streamRagChat(request)) {
        if (responseStream.writableEnded) {
          return;
        }

        responseStream.write(formatRagChatSseEvent(event));
      }
    } catch (error) {
      if (!responseStream.writableEnded) {
        responseStream.write(
          formatRagChatSseEvent({
            type: 'error',
            ok: false,
            error: getErrorMessage(error),
          }),
        );
      }
    }

    responseStream.end();
  });

  router.post('/chat', async ({ body }, responseStream) => {
    responseStream.setContentType?.('text/event-stream; charset=utf-8');

    const request = parseChatRequest(body);

    for await (const event of runChat(request)) {
      writeSse((chunk) => responseStream.write(chunk), event);
    }

    responseStream.end();
  });

  router.get('/healthcheck', (_params, responseStream) => {
    responseStream.setContentType?.('application/json; charset=utf-8');
    responseStream.end(
      JSON.stringify({
        ok: true,
        name: 'local-agent-chat',
        transport: 'server-sent-events',
      }),
    );
  });

  router.fallback((_params, responseStream) => {
    responseStream.setContentType?.('application/json; charset=utf-8');
    responseStream.end(
      JSON.stringify({
        message: 'Not Found',
      }),
    );
  });

  const handler = create.streamApi({
    healthcheck: {
      path: '/_healthcheck',
    },
  })(router.handle());

  return async (...args: Parameters<typeof handler>) => {
    const [event, responseStream] = args;

    setCorsHeaders(responseStream as HeaderResponseStream);

    if (event.httpMethod === 'OPTIONS') {
      responseStream.end();
      return;
    }

    await handler(...args);
  };
};

export const startChatServer = () => streamServer(createChatHandler());

startChatServer();
