import { describe, expect, it } from '@jest/globals';

import { buildRagPrompt, NO_CONTEXT_ANSWER } from './buildRagPrompt.js';

describe('buildRagPrompt', () => {
  it('builds a grounded prompt from retrieved chunks', () => {
    const messages = buildRagPrompt({
      message: 'What does the doc say?',
      chunks: [
        {
          documentTitle: 'Notes',
          path: 'docs/notes.md',
          chunkIndex: 0,
          score: 0.82345,
          content: 'Use the local model.',
        },
      ],
    });

    expect(messages).toEqual([
      {
        role: 'system',
        content: expect.stringContaining('Answer using only the provided indexed file context'),
      },
      {
        role: 'user',
        content: expect.stringContaining('[1] Notes (docs/notes.md, chunk 0, score 0.823)'),
      },
    ]);
    expect(messages[1]?.content).toContain('Question: What does the doc say?');
    expect(messages[1]?.content).toContain('Use the local model.');
  });

  it('builds a no-context prompt', () => {
    expect(
      buildRagPrompt({
        message: 'Anything indexed?',
        chunks: [],
      }),
    ).toEqual([
      {
        role: 'system',
        content: 'You answer questions only from indexed local file context.',
      },
      {
        role: 'user',
        content: `Question: Anything indexed?\n\nNo indexed context was found. Reply exactly: ${NO_CONTEXT_ANSWER}`,
      },
    ]);
  });
});
