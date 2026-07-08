export type StreamChatRequest = {
  message: string;
  limit: number;
};

type StreamChatRequestBody = {
  message?: unknown;
  limit?: unknown;
};

const parseBody = (body: string | undefined): StreamChatRequestBody => {
  if (!body?.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(body) as unknown;

    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    throw new Error('Request body must be valid JSON.');
  }
};

const parseLimit = (limit: unknown): number => {
  if (limit === undefined) {
    return 5;
  }

  if (typeof limit !== 'number' || !Number.isInteger(limit) || limit < 1 || limit > 10) {
    throw new Error('limit must be an integer from 1 to 10.');
  }

  return limit;
};

export const parseStreamChatRequest = (body: string | undefined): StreamChatRequest => {
  const parsed = parseBody(body);
  const message = typeof parsed.message === 'string' ? parsed.message.trim() : '';

  if (!message) {
    throw new Error('message is required.');
  }

  return {
    message,
    limit: parseLimit(parsed.limit),
  };
};
