import { describe, expect, it } from '@jest/globals';

import { validateChatCompletion } from './validateChatCompletion.js';

describe('validateChatCompletion', () => {
  it('returns a valid answer', () => {
    expect(
      validateChatCompletion({
        choices: [
          {
            message: {
              content: 'Answer.',
            },
          },
        ],
      }),
    ).toBe('Answer.');
  });

  it('rejects blank answers', () => {
    expect(() =>
      validateChatCompletion({
        choices: [
          {
            message: {
              content: '   ',
            },
          },
        ],
      }),
    ).toThrow('Chat completion response did not include an answer.');
  });
});
