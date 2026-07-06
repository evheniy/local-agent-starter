import { describe, expect, it } from '@jest/globals';

import * as publicApi from './index.js';

describe('chat public API', () => {
  it('exports the chat runtime', () => {
    expect(publicApi.createChatResponse).toBeDefined();
    expect(publicApi.runChat).toBeDefined();
  });
});
