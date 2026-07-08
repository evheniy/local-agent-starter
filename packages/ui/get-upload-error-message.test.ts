import { describe, expect, it, jest } from '@jest/globals';

import { getUploadErrorMessage } from './get-upload-error-message.js';

const createResponse = ({
  body = {},
  status = 500,
}: {
  body?: unknown;
  status?: number;
} = {}) =>
  ({
    json: jest.fn(() => Promise.resolve(body)),
    status,
  }) as unknown as Response;

describe('getUploadErrorMessage', () => {
  it('returns duplicate upload messages before parsing the response body', async () => {
    await expect(getUploadErrorMessage(createResponse({ status: 409 }))).resolves.toBe(
      'This file is already uploaded.',
    );
  });

  it('uses response messages and status fallbacks', async () => {
    await expect(getUploadErrorMessage(createResponse({ body: { message: 'Storage offline.' } }))).resolves.toBe(
      'Storage offline.',
    );
    await expect(getUploadErrorMessage(createResponse())).resolves.toBe('Upload failed with status 500');
  });

  it('falls back when failure bodies cannot be parsed', async () => {
    await expect(
      getUploadErrorMessage({
        json: jest.fn(() => Promise.reject(new Error('invalid json'))),
        status: 500,
      } as unknown as Response),
    ).resolves.toBe('Upload failed with status 500');
  });
});
