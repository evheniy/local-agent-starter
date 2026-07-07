import { describe, expect, it } from '@jest/globals';

import { statusLabels } from './status-labels.js';

describe('statusLabels', () => {
  it('maps every trace event status to its display label', () => {
    expect(statusLabels).toEqual({
      pending: 'Pending',
      running: 'Running',
      done: 'Done',
      error: 'Error',
    });
  });
});
