import { describe, expect, it } from '@jest/globals';

import { formatRagChatSseEvent, formatSseEvent } from './sse.js';

describe('SSE formatting', () => {
  it('formats generic SSE events', () => {
    expect(formatSseEvent('answer_delta', { text: 'hello' })).toBe('event: answer_delta\ndata: {"text":"hello"}\n\n');
  });

  it('formats RAG chat stream events', () => {
    expect(
      formatRagChatSseEvent({
        type: 'sources',
        sources: [],
      }),
    ).toBe('event: sources\ndata: {"sources":[]}\n\n');
    expect(
      formatRagChatSseEvent({
        type: 'answer_delta',
        text: 'hello',
      }),
    ).toBe('event: answer_delta\ndata: {"text":"hello"}\n\n');
    expect(
      formatRagChatSseEvent({
        type: 'done',
        ok: true,
      }),
    ).toBe('event: done\ndata: {"ok":true}\n\n');
    expect(
      formatRagChatSseEvent({
        type: 'error',
        ok: false,
        error: 'offline',
      }),
    ).toBe('event: error\ndata: {"ok":false,"error":"offline"}\n\n');
  });
});
