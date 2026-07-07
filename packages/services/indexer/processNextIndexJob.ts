import { indexUploadedFile as indexStoredUploadedFile } from '../documents/index.js';
import {
  claimNextRagIndexJob as claimStoredNextRagIndexJob,
  completeRagIndexJob as completeStoredRagIndexJob,
  failRagIndexJob as failStoredRagIndexJob,
  updateUploadedFileStatus as updateStoredUploadedFileStatus,
} from '../postgres/index.js';

import type { ProcessNextIndexJobDependencies, ProcessNextIndexJobOutput, ProcessNextIndexJobType } from './types.js';

const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : 'Indexing job failed.');

const createDefaultDependencies = (): ProcessNextIndexJobDependencies => ({
  claimNextRagIndexJob: claimStoredNextRagIndexJob(),
  completeRagIndexJob: completeStoredRagIndexJob(),
  failRagIndexJob: failStoredRagIndexJob(),
  updateUploadedFileStatus: updateStoredUploadedFileStatus(),
  indexUploadedFile: indexStoredUploadedFile,
});

export const createProcessNextIndexJob = (
  dependencies: Partial<ProcessNextIndexJobDependencies> = {},
): ProcessNextIndexJobType => {
  const services = {
    ...createDefaultDependencies(),
    ...dependencies,
  };

  return async (): Promise<ProcessNextIndexJobOutput> => {
    const job = await services.claimNextRagIndexJob();

    if (!job) {
      return {
        indexed: false,
      };
    }

    try {
      await services.updateUploadedFileStatus({
        id: job.fileId,
        status: 'indexing',
      });
      await services.indexUploadedFile({
        fileId: job.fileId,
      });
      const completedJob = await services.completeRagIndexJob({
        id: job.id,
      });

      return {
        job: completedJob ?? job,
        indexed: true,
      };
    } catch (error) {
      const message = getErrorMessage(error);

      await services.failRagIndexJob({
        id: job.id,
        error: message,
      });
      await services.updateUploadedFileStatus({
        id: job.fileId,
        status: 'error',
      });

      return {
        job,
        indexed: false,
      };
    }
  };
};

export const processNextIndexJob = createProcessNextIndexJob();
