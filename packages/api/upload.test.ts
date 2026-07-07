import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { HandlerParams } from '@vyriy/router';

import { createUploadHandler } from './upload.js';

import type {
  CreateUploadedFileType,
  EnqueueRagIndexJobType,
  GetUploadedFileByPathType,
  UploadedFile,
} from '@p/services/postgres';

describe('upload handler', () => {
  const createUploadedFile = jest.fn<CreateUploadedFileType>(({ name, path, size, type }): Promise<UploadedFile> => {
    return Promise.resolve({
      id: `file-${name}`,
      name,
      path,
      size,
      type,
      status: 'uploaded',
    });
  });
  const getUploadedFileByPath = jest.fn<GetUploadedFileByPathType>(() => Promise.resolve(undefined));
  const enqueueRagIndexJob = jest.fn<EnqueueRagIndexJobType>(({ fileId }) =>
    Promise.resolve({
      id: `job-${fileId}`,
      fileId,
      status: 'queued',
      attempts: 0,
    }),
  );
  const upload = createUploadHandler({ createUploadedFile, enqueueRagIndexJob, getUploadedFileByPath });

  beforeEach(() => {
    jest.clearAllMocks();
  });

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

      expect(response).toMatchObject({
        statusCode: 201,
      });
      expect(JSON.parse(response.body)).toEqual({
        ok: true,
        filename: 'AGENTS.md',
        path: 'docs/AGENTS.md',
        bytes: 10,
        file: {
          id: 'file-AGENTS.md',
          name: 'AGENTS.md',
          path: 'docs/AGENTS.md',
          size: 10,
          status: 'uploaded',
        },
        indexingJob: {
          id: 'job-file-AGENTS.md',
          fileId: 'file-AGENTS.md',
          status: 'queued',
          attempts: 0,
        },
      });
      expect(createUploadedFile).toHaveBeenCalledWith({
        name: 'AGENTS.md',
        path: 'docs/AGENTS.md',
        size: 10,
        type: undefined,
      });
      expect(enqueueRagIndexJob).toHaveBeenCalledWith({
        fileId: 'file-AGENTS.md',
      });
      expect(getUploadedFileByPath).toHaveBeenCalledWith('docs/AGENTS.md');
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

  it('rejects duplicate uploads before writing file content', async () => {
    const existingFile: UploadedFile = {
      id: 'file-AGENTS.md',
      name: 'AGENTS.md',
      path: 'docs/AGENTS.md',
      size: 10,
      status: 'uploaded',
    };
    const duplicateLookup = jest.fn<GetUploadedFileByPathType>(() => Promise.resolve(existingFile));
    const saveUploadedFile = jest.fn(() => Promise.reject(new Error('Storage should not be called.')));
    const duplicateUpload = createUploadHandler({
      createUploadedFile,
      enqueueRagIndexJob,
      getUploadedFileByPath: duplicateLookup,
      saveUploadedFile,
    });

    await expect(
      duplicateUpload({
        body: 'hello docs',
        event: {
          isBase64Encoded: false,
        },
        headers: {},
        query: {
          filename: '../AGENTS.md',
        },
      } as unknown as HandlerParams),
    ).resolves.toEqual({
      statusCode: 409,
      body: JSON.stringify({
        message: 'File already exists.',
        file: existingFile,
      }),
    });
    expect(duplicateLookup).toHaveBeenCalledWith('docs/AGENTS.md');
    expect(saveUploadedFile).not.toHaveBeenCalled();
    expect(enqueueRagIndexJob).not.toHaveBeenCalledWith({
      fileId: existingFile.id,
    });
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
    const filePath = join(process.cwd(), 'docker', 'docs', 'upload-123.txt');

    try {
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
      });
      expect(JSON.parse(response.body)).toEqual({
        ok: true,
        filename: 'upload-123.txt',
        path: 'docs/upload-123.txt',
        bytes: 14,
        file: {
          id: 'file-upload-123.txt',
          name: 'upload-123.txt',
          path: 'docs/upload-123.txt',
          size: 14,
          status: 'uploaded',
        },
        indexingJob: {
          id: 'job-file-upload-123.txt',
          fileId: 'file-upload-123.txt',
          status: 'queued',
          attempts: 0,
        },
      });
      await expect(readFile(filePath, 'utf8')).resolves.toBe('generated docs');
    } finally {
      await rm(filePath, { force: true });
    }
  });

  it('uses the local docs directory when development inherits the Docker docs path', async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const filePath = join(process.cwd(), 'docker', 'docs', 'upload-321.txt');

    jest.spyOn(Date, 'now').mockReturnValue(321);

    try {
      process.env.NODE_ENV = 'development';
      process.env.DOCS_DIR = '/app/docs';

      const response = await upload({
        body: 'local docs',
        event: {
          isBase64Encoded: false,
        },
        headers: {},
        query: {},
      } as unknown as HandlerParams);

      expect(response).toMatchObject({
        statusCode: 201,
      });
      expect(JSON.parse(response.body)).toEqual({
        ok: true,
        filename: 'upload-321.txt',
        path: 'docs/upload-321.txt',
        bytes: 10,
        file: {
          id: 'file-upload-321.txt',
          name: 'upload-321.txt',
          path: 'docs/upload-321.txt',
          size: 10,
          status: 'uploaded',
        },
        indexingJob: {
          id: 'job-file-upload-321.txt',
          fileId: 'file-upload-321.txt',
          status: 'queued',
          attempts: 0,
        },
      });
      await expect(readFile(filePath, 'utf8')).resolves.toBe('local docs');
    } finally {
      if (typeof previousNodeEnv === 'string') {
        process.env.NODE_ENV = previousNodeEnv;
      } else {
        delete process.env.NODE_ENV;
      }

      delete process.env.DOCS_DIR;
      await rm(filePath, { force: true });
    }
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
        const { createUploadHandler: createIsolatedUploadHandler } = await import('./upload.js');
        const isolatedUpload = createIsolatedUploadHandler({
          createUploadedFile,
          enqueueRagIndexJob,
          getUploadedFileByPath,
        });

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

  it('returns after enqueueing without waiting for embedding work', async () => {
    const docsDir = await mkdtemp(join(tmpdir(), 'local-agent-docs-'));
    const indexUploadedFile = jest.fn(() => Promise.reject(new Error('Indexing should not run during upload.')));
    const uploadWithoutIndexing = createUploadHandler({
      createUploadedFile,
      enqueueRagIndexJob,
      getUploadedFileByPath,
    });

    try {
      await expect(uploadWithoutIndexing(createParams(docsDir))).resolves.toMatchObject({
        statusCode: 201,
      });
      expect(indexUploadedFile).not.toHaveBeenCalled();
      expect(enqueueRagIndexJob).toHaveBeenCalledWith({
        fileId: 'file-AGENTS.md',
      });
    } finally {
      delete process.env.DOCS_DIR;
      await rm(docsDir, { recursive: true, force: true });
    }
  });
});
