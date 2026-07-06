import { create } from '@vyriy/handler';
import { createRouter as createStreamRouter } from '@vyriy/router/stream';
import { streamServer } from '@vyriy/server';

import type { ChatRequest, ChatStreamEvent } from '@p/chat';
import { runChat } from '@p/chat';

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

export const createChatHandler = () => {
  const router = createStreamRouter();

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

  return create.streamApi({
    healthcheck: {
      path: '/_healthcheck',
    },
  })(router.handle());
};

export const startChatServer = () => streamServer(createChatHandler());

startChatServer();
