import { describe, expect, it, jest } from '@jest/globals';

import { createRagChat } from './createRagChat.js';
import { createContentPreview } from './formatRagSources.js';
import { NO_CONTEXT_ANSWER } from './buildRagPrompt.js';

import type { RagChatDependencies } from './types.js';

describe('createRagChat', () => {
  it('retrieves chunks, calls the LLM, and returns answer with source previews', async () => {
    const dependencies: RagChatDependencies = {
      retrieveRelevantChunks: jest.fn(() =>
        Promise.resolve([
          {
            documentTitle: 'Notes',
            path: 'docs/notes.md',
            chunkIndex: 0,
            score: 0.82,
            content: 'A useful chunk with whitespace.\n\nMore detail.',
          },
        ]),
      ),
      createChatCompletion: jest.fn(() => Promise.resolve('Use the local model. [1]')),
    };

    await expect(createRagChat(dependencies)({ message: 'What should I use?', limit: 2 })).resolves.toEqual({
      answer: 'Use the local model. [1]',
      sources: [
        {
          documentTitle: 'Notes',
          path: 'docs/notes.md',
          chunkIndex: 0,
          score: 0.82,
          contentPreview: 'A useful chunk with whitespace. More detail.',
        },
      ],
    });
    expect(dependencies.retrieveRelevantChunks).toHaveBeenCalledWith({
      message: 'What should I use?',
      limit: 2,
    });
    expect(dependencies.createChatCompletion).toHaveBeenCalledWith({
      messages: expect.arrayContaining([
        expect.objectContaining({
          role: 'user',
          content: expect.stringContaining('A useful chunk with whitespace.'),
        }),
      ]),
    });
  });

  it('handles no retrieved chunks', async () => {
    const dependencies: RagChatDependencies = {
      retrieveRelevantChunks: jest.fn(() => Promise.resolve([])),
      createChatCompletion: jest.fn(() => Promise.resolve(NO_CONTEXT_ANSWER)),
    };

    await expect(createRagChat(dependencies)({ message: 'Missing?' })).resolves.toEqual({
      answer: NO_CONTEXT_ANSWER,
      sources: [],
    });
    expect(dependencies.createChatCompletion).toHaveBeenCalledWith({
      messages: expect.arrayContaining([
        expect.objectContaining({
          content: expect.stringContaining('No indexed context was found.'),
        }),
      ]),
    });
  });

  it('trims long source previews', () => {
    expect(createContentPreview('a'.repeat(241))).toBe(`${'a'.repeat(239)}...`);
  });
});
