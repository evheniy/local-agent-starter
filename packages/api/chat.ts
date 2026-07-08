import type { Handler } from '@vyriy/router';

import { ragChat as runStoredRagChat } from '@p/services';

import type { ChatRequestBody, CreateChatHandlerOptions } from './types.js';

const parseRequestBody = (body: string | undefined): ChatRequestBody => {
  if (!body) {
    return {};
  }

  try {
    const parsed = JSON.parse(body) as unknown;

    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
};

const parseLimit = (limit: unknown): number | undefined => {
  if (limit === undefined) {
    return undefined;
  }

  if (typeof limit !== 'number' || !Number.isFinite(limit) || limit < 1) {
    throw new Error('limit must be a positive number.');
  }

  return limit;
};

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Chat request failed.');

export const createChatHandler = ({ ragChat = runStoredRagChat }: CreateChatHandlerOptions = {}): Handler => {
  return async ({ body }) => {
    let request: ChatRequestBody;

    try {
      request = parseRequestBody(body);
      const message = typeof request.message === 'string' ? request.message.trim() : '';

      if (!message) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            ok: false,
            error: 'message is required.',
          }),
        };
      }

      const result = await ragChat({
        message,
        limit: parseLimit(request.limit),
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          answer: result.answer,
          sources: result.sources,
        }),
      };
    } catch (error) {
      const message = getErrorMessage(error);
      const statusCode = message.startsWith('Request body') || message.startsWith('limit') ? 400 : 500;

      return {
        statusCode,
        body: JSON.stringify({
          ok: false,
          error: message,
        }),
      };
    }
  };
};

export const chat = createChatHandler();
