import { describe, it, expect } from '@jest/globals';

import * as publicApi from './index.js';

describe('public API', () => {
  it('exports public components', () => {
    expect(publicApi.AgentShell).toBeDefined();
    expect(publicApi.AgentTabs).toBeDefined();
    expect(publicApi.ChatPanel).toBeDefined();
    expect(publicApi.FileUploadPanel).toBeDefined();
    expect(publicApi.IndexedFilesList).toBeDefined();
    expect(publicApi.RetrievedChunks).toBeDefined();
    expect(publicApi.TracePanel).toBeDefined();
  });
});
