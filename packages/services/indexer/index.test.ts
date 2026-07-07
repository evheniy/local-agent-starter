import { describe, expect, it, jest } from '@jest/globals';

jest.mock('./processNextIndexJob.js', () => ({
  createProcessNextIndexJob: jest.fn(),
  processNextIndexJob: jest.fn(),
}));

describe('indexer service public API', () => {
  it('re-exports worker helpers', async () => {
    const publicApi = await import('./index.js');

    expect(publicApi.createProcessNextIndexJob).toBeDefined();
    expect(publicApi.processNextIndexJob).toBeDefined();
  });
});
