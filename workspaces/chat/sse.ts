import type { RagChatStreamEvent } from '@p/services';

export const formatSseEvent = (event: string, data: unknown): string =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

export const formatRagChatSseEvent = (event: RagChatStreamEvent): string => {
  switch (event.type) {
    case 'sources':
      return formatSseEvent('sources', {
        sources: event.sources,
      });
    case 'answer_delta':
      return formatSseEvent('answer_delta', {
        text: event.text,
      });
    case 'done':
      return formatSseEvent('done', {
        ok: true,
      });
    case 'error':
      return formatSseEvent('error', {
        ok: false,
        error: event.error,
      });
  }
};
