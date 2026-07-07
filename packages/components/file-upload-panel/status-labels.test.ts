import { describe, expect, it } from '@jest/globals';

import { statusLabels } from './status-labels.js';

describe('statusLabels', () => {
  it('maps every upload status to its display label', () => {
    expect(statusLabels).toEqual({
      idle: 'Select a file to upload.',
      uploading: 'Uploading file...',
      success: 'File uploaded successfully.',
      error: 'Upload failed.',
    });
  });
});
