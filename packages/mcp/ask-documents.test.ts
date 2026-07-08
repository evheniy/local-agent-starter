import { describe, expect, it, jest } from '@jest/globals';

import { createAskDocumentsTool } from './ask-documents.js';

import type { RagChatType } from '@p/services';

const readJsonResult = (text: string) => JSON.parse(text) as unknown;

describe('askDocumentsTool', () => {
  it('calls chat service and returns answer with compact sources', async () => {
    const ragChat = jest.fn<RagChatType>(() =>
      Promise.resolve({
        answer: 'This repository is a local RAG starter. [1]',
        sources: [
          {
            documentTitle: 'README.md',
            path: 'docs/README.md',
            chunkIndex: 0,
            score: 0.81,
            contentPreview: 'Preview omitted from MCP ask output.',
          },
        ],
      }),
    );
    const tool = createAskDocumentsTool({ ragChat });

    const result = await tool.handler({ question: '  What is this repository?  ' });

    expect(readJsonResult(result.content[0]?.text ?? '')).toEqual({
      answer: 'This repository is a local RAG starter. [1]',
      sources: [
        {
          documentTitle: 'README.md',
          path: 'docs/README.md',
          chunkIndex: 0,
          score: 0.81,
        },
      ],
    });
    expect(ragChat).toHaveBeenCalledWith({
      message: 'What is this repository?',
      limit: 5,
    });
  });

  it('supports no sources', async () => {
    const ragChat = jest.fn<RagChatType>(() =>
      Promise.resolve({
        answer: 'No indexed content found.',
        sources: [],
      }),
    );
    const tool = createAskDocumentsTool({ ragChat });

    await expect(tool.handler({ question: 'Missing?', limit: 2 })).resolves.toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            answer: 'No indexed content found.',
            sources: [],
          }),
        },
      ],
    });
    expect(ragChat).toHaveBeenCalledWith({
      message: 'Missing?',
      limit: 2,
    });
  });

  it('rejects empty questions', async () => {
    const ragChat = jest.fn<RagChatType>();
    const tool = createAskDocumentsTool({ ragChat });

    await expect(tool.handler({ question: '   ' })).rejects.toThrow();
    expect(ragChat).not.toHaveBeenCalled();
  });

  it('rejects limits above 10', async () => {
    const ragChat = jest.fn<RagChatType>();
    const tool = createAskDocumentsTool({ ragChat });

    await expect(tool.handler({ question: 'What?', limit: 11 })).rejects.toThrow();
    expect(ragChat).not.toHaveBeenCalled();
  });
});
