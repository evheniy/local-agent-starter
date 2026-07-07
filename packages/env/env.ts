import { getEnv } from '@vyriy/env';
import { path } from '@vyriy/path';

const LOCAL_DOCS_DIR = path('docker', 'docs');
const DOCKER_DOCS_DIR = path('/app', 'docs');
const getDefaultDocsDir = () => (process.env.NODE_ENV === 'production' ? DOCKER_DOCS_DIR : LOCAL_DOCS_DIR);

/** Reads the API origin used for server endpoints. */
export const getApi = () => getEnv('API');

/** Reads the document upload directory. */
export const getDocsDir = () => {
  if (process.env.NODE_ENV !== 'production' && process.env.DOCS_DIR === DOCKER_DOCS_DIR) {
    return LOCAL_DOCS_DIR;
  }

  return process.env.DOCS_DIR ? path(process.env.DOCS_DIR) : getDefaultDocsDir();
};

/** Reads the UI origin used for browser assets. */
export const getUi = () => getEnv('UI');
