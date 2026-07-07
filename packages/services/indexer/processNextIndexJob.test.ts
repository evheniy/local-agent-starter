import { describe, expect, it, jest } from '@jest/globals';

import { createProcessNextIndexJob } from './processNextIndexJob.js';

import type { ProcessNextIndexJobDependencies } from './types.js';

const job = {
  id: 'job-1',
  fileId: 'file-1',
  status: 'running' as const,
  attempts: 1,
};

const createDependencies = (): ProcessNextIndexJobDependencies => ({
  claimNextRagIndexJob: jest.fn(() => Promise.resolve(job)),
  completeRagIndexJob: jest.fn(() =>
    Promise.resolve({
      ...job,
      status: 'completed' as const,
    }),
  ),
  failRagIndexJob: jest.fn(() =>
    Promise.resolve({
      ...job,
      status: 'failed' as const,
      error: 'failed',
    }),
  ),
  updateUploadedFileStatus: jest.fn(() => Promise.resolve(undefined)),
  indexUploadedFile: jest.fn(() =>
    Promise.resolve({
      fileId: 'file-1',
      documentId: 'document-1',
      chunksCount: 2,
    }),
  ),
});

describe('processNextIndexJob', () => {
  it('returns idle output when there is no queued job', async () => {
    const dependencies = createDependencies();
    dependencies.claimNextRagIndexJob = jest.fn(() => Promise.resolve(undefined));
    const processNextIndexJob = createProcessNextIndexJob(dependencies);

    await expect(processNextIndexJob()).resolves.toEqual({
      indexed: false,
    });
    expect(dependencies.indexUploadedFile).not.toHaveBeenCalled();
  });

  it('runs successful worker indexing and completes the job', async () => {
    const dependencies = createDependencies();
    const processNextIndexJob = createProcessNextIndexJob(dependencies);

    await expect(processNextIndexJob()).resolves.toEqual({
      job: {
        ...job,
        status: 'completed',
      },
      indexed: true,
    });
    expect(dependencies.claimNextRagIndexJob).toHaveBeenCalledTimes(1);
    expect(dependencies.updateUploadedFileStatus).toHaveBeenCalledWith({
      id: 'file-1',
      status: 'indexing',
    });
    expect(dependencies.indexUploadedFile).toHaveBeenCalledWith({
      fileId: 'file-1',
    });
    expect(dependencies.completeRagIndexJob).toHaveBeenCalledWith({
      id: 'job-1',
    });
    expect(dependencies.failRagIndexJob).not.toHaveBeenCalled();
  });

  it('keeps the claimed job in the output when completion update returns no row', async () => {
    const dependencies = createDependencies();
    dependencies.completeRagIndexJob = jest.fn(() => Promise.resolve(undefined));
    const processNextIndexJob = createProcessNextIndexJob(dependencies);

    await expect(processNextIndexJob()).resolves.toEqual({
      job,
      indexed: true,
    });
  });

  it('marks the job failed and file errored when indexing fails', async () => {
    const dependencies = createDependencies();
    dependencies.indexUploadedFile = jest.fn(() => Promise.reject(new Error('embedding offline')));
    const processNextIndexJob = createProcessNextIndexJob(dependencies);

    await expect(processNextIndexJob()).resolves.toEqual({
      job,
      indexed: false,
    });
    expect(dependencies.failRagIndexJob).toHaveBeenCalledWith({
      id: 'job-1',
      error: 'embedding offline',
    });
    expect(dependencies.updateUploadedFileStatus).toHaveBeenLastCalledWith({
      id: 'file-1',
      status: 'error',
    });
  });

  it('stores a fallback error message for non-error failures', async () => {
    const dependencies = createDependencies();
    dependencies.indexUploadedFile = jest.fn(
      () =>
        new Promise<never>((_resolve, reject) => {
          const rejectUnknown: (reason?: unknown) => void = reject;

          rejectUnknown('offline');
        }),
    );
    const processNextIndexJob = createProcessNextIndexJob(dependencies);

    await expect(processNextIndexJob()).resolves.toMatchObject({
      indexed: false,
    });
    expect(dependencies.failRagIndexJob).toHaveBeenCalledWith({
      id: 'job-1',
      error: 'Indexing job failed.',
    });
  });
});
