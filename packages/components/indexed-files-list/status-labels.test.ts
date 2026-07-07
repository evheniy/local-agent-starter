import { describe, expect, it } from '@jest/globals';

import { statusLabels } from './status-labels.js';

describe('statusLabels', () => {
  it('maps every indexed file status to its display label', () => {
    expect(statusLabels).toEqual({
      uploaded: 'Uploaded',
      indexing: 'Indexing',
      indexed: 'Indexed',
      error: 'Error',
    });
  });
});
