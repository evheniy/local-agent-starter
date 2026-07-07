import type {
  ClaimNextRagIndexJobType,
  CompleteRagIndexJobType,
  FailRagIndexJobType,
  RagIndexJob,
  UpdateUploadedFileStatusType,
} from '../postgres/index.js';
import type { IndexUploadedFileType } from '../documents/index.js';

export type ProcessNextIndexJobOutput = {
  job?: RagIndexJob;
  indexed?: boolean;
};

export type ProcessNextIndexJobDependencies = {
  claimNextRagIndexJob: ClaimNextRagIndexJobType;
  completeRagIndexJob: CompleteRagIndexJobType;
  failRagIndexJob: FailRagIndexJobType;
  updateUploadedFileStatus: UpdateUploadedFileStatusType;
  indexUploadedFile: IndexUploadedFileType;
};

export type ProcessNextIndexJobType = () => Promise<ProcessNextIndexJobOutput>;
