import { describe, expect, it } from '@jest/globals';

import { json } from './json.js';
import { getResponse } from './test-utils.js';

describe('json', () => {
  it('writes a JSON response', () => {
    const response = getResponse();

    json(response, 201, { ok: true });

    expect(response.writeHeadMock).toHaveBeenCalledWith(201, {
      'content-type': 'application/json; charset=utf-8',
    });
    expect(response.endMock).toHaveBeenCalledWith(JSON.stringify({ ok: true }));
  });
});
