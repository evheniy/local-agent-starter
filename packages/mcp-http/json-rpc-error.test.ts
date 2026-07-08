import { describe, expect, it } from '@jest/globals';

import { jsonRpcError } from './json-rpc-error.js';
import { getResponse } from './test-utils.js';

describe('jsonRpcError', () => {
  it('writes a JSON-RPC error response', () => {
    const response = getResponse();

    jsonRpcError(response, 405, -32000, 'Method not allowed.');

    expect(response.writeHeadMock).toHaveBeenCalledWith(405, {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(response.endMock).toHaveBeenCalledWith(
      JSON.stringify({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      }),
    );
  });
});
