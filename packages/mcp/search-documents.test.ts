import { describe, expect, it, jest } from '@jest/globals';

import { createSearchDocumentsTool } from './search-documents.js';

import type { RetrieveRelevantChunksType } from '@p/services';

const readJsonResult = (text: string) => JSON.parse(text) as unknown;

describe('searchDocumentsTool', () => {
  it('uses default limit and returns structured results', async () => {
    const retrieveRelevantChunks = jest.fn<RetrieveRelevantChunksType>(() =>
      Promise.resolve([
        {
          documentTitle: 'notes.md',
          path: 'docs/notes.md',
          chunkIndex: 0,
          score: 0.82,
          content: 'Relevant chunk text.',
        },
      ]),
    );
    const tool = createSearchDocumentsTool({ retrieveRelevantChunks });

    const result = await tool.handler({ query: '  architecture  ' });

    expect(readJsonResult(result.content[0]?.text ?? '')).toEqual({
      results: [
        {
          documentTitle: 'notes.md',
          path: 'docs/notes.md',
          chunkIndex: 0,
          score: 0.82,
          content: 'Relevant chunk text.',
        },
      ],
    });
    expect(retrieveRelevantChunks).toHaveBeenCalledWith({
      message: 'architecture',
      limit: 5,
    });
  });

  it('uses provided limit', async () => {
    const retrieveRelevantChunks = jest.fn<RetrieveRelevantChunksType>(() => Promise.resolve([]));
    const tool = createSearchDocumentsTool({ retrieveRelevantChunks });

    await expect(tool.handler({ query: 'notes', limit: 3 })).resolves.toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            results: [],
          }),
        },
      ],
    });
    expect(retrieveRelevantChunks).toHaveBeenCalledWith({
      message: 'notes',
      limit: 3,
    });
  });

  it('rejects empty queries', async () => {
    const retrieveRelevantChunks = jest.fn<RetrieveRelevantChunksType>();
    const tool = createSearchDocumentsTool({ retrieveRelevantChunks });

    await expect(tool.handler({ query: '   ' })).rejects.toThrow();
    expect(retrieveRelevantChunks).not.toHaveBeenCalled();
  });

  it('rejects limits above 10', async () => {
    const retrieveRelevantChunks = jest.fn<RetrieveRelevantChunksType>();
    const tool = createSearchDocumentsTool({ retrieveRelevantChunks });

    await expect(tool.handler({ query: 'notes', limit: 11 })).rejects.toThrow();
    expect(retrieveRelevantChunks).not.toHaveBeenCalled();
  });
});
