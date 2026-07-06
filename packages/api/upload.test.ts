import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { describe, expect, it, jest } from '@jest/globals';
import type { HandlerParams } from '@vyriy/router';

import { upload } from './upload.js';

describe('upload handler', () => {
  const createParams = (docsDir: string, body = 'hello docs'): HandlerParams => {
    process.env.DOCS_DIR = docsDir;

    return {
      body,
      event: {
        body,
        headers: {},
        httpMethod: 'POST',
        isBase64Encoded: false,
        multiValueHeaders: {},
        multiValueQueryStringParameters: {},
        path: '/upload',
        pathParameters: null,
        queryStringParameters: {
          filename: '../AGENTS.md',
        },
        requestContext: {},
        resource: '/upload',
        stageVariables: null,
      },
      headers: {},
      query: {
        filename: '../AGENTS.md',
      },
    } as unknown as HandlerParams;
  };

  it('writes an uploaded body into the docs directory', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-docs-'));

    try {
      const response = await upload(createParams(docsDir));

      expect(response).toEqual({
        statusCode: 201,
        headers: {
          'access-control-allow-origin': '*',
          'content-type': 'application/json; charset=utf-8',
          'x-content-type-options': 'nosniff',
        },
        body: JSON.stringify({
          ok: true,
          filename: 'AGENTS.md',
          path: 'docs/AGENTS.md',
          bytes: 10,
        }),
      });
      await expect(readFile(join(docsDir, 'AGENTS.md'), 'utf8')).resolves.toBe('hello docs');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('rejects empty uploads', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-docs-'));

    try {
      await expect(upload(createParams(docsDir, ''))).resolves.toMatchObject({
        statusCode: 400,
        body: JSON.stringify({
          message: 'Upload body is required.',
        }),
      });
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('uses upload metadata from headers and supports base64 bodies', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-docs-'));

    try {
      process.env.DOCS_DIR = docsDir;

      await upload({
        body: Buffer.from('header docs').toString('base64'),
        event: {
          isBase64Encoded: true,
        },
        headers: {
          'X-File-Name': 'Header Notes.md',
        },
        query: {},
      } as unknown as HandlerParams);
      await upload({
        body: 'disposition docs',
        event: {
          isBase64Encoded: false,
        },
        headers: {
          'content-disposition': 'attachment; filename="disposition.md"',
        },
        query: {},
      } as unknown as HandlerParams);

      await expect(readFile(join(docsDir, 'Header-Notes.md'), 'utf8')).resolves.toBe('header docs');
      await expect(readFile(join(docsDir, 'disposition.md'), 'utf8')).resolves.toBe('disposition docs');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('falls back to the default docs directory and generated file name', async () => {
    jest.spyOn(Date, 'now').mockReturnValue(123);
    delete process.env.DOCS_DIR;

    const response = await upload({
      body: 'generated docs',
      event: {
        isBase64Encoded: false,
      },
      headers: {},
      query: {},
    } as unknown as HandlerParams);

    expect(response).toMatchObject({
      statusCode: 201,
      body: JSON.stringify({
        ok: true,
        filename: 'upload-123.txt',
        path: 'docs/upload-123.txt',
        bytes: 14,
      }),
    });
    await expect(readFile(join(process.cwd(), 'docker', 'docs', 'upload-123.txt'), 'utf8')).resolves.toBe(
      'generated docs',
    );
  });

  it('handles missing headers while deriving upload metadata', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-docs-'));

    try {
      process.env.DOCS_DIR = docsDir;
      jest.spyOn(Date, 'now').mockReturnValue(789);

      await upload({
        body: 'missing headers',
        event: {
          isBase64Encoded: false,
        },
        query: {},
      } as unknown as HandlerParams);

      await expect(readFile(join(docsDir, 'upload-789.txt'), 'utf8')).resolves.toBe('missing headers');
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });

  it('covers production defaults and generated fallback filenames', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-docs-'));
    const previousNodeEnv = process.env.NODE_ENV;

    jest.spyOn(Date, 'now').mockReturnValue(456);

    try {
      process.env.NODE_ENV = 'production';
      process.env.DOCS_DIR = docsDir;

      await jest.isolateModulesAsync(async () => {
        const { upload: isolatedUpload } = await import('./upload.js');

        await isolatedUpload({
          body: 'fallback docs',
          event: {
            isBase64Encoded: false,
          },
          query: {
            filename: '///',
          },
        } as unknown as HandlerParams);
      });

      await expect(readFile(join(docsDir, 'upload-456.txt'), 'utf8')).resolves.toBe('fallback docs');
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });
});
