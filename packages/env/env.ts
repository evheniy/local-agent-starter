import { getEnv } from '@vyriy/env';

/** Reads the API origin used for server endpoints. */
export const getApi = () => getEnv('API');

/** Reads the CDN origin used for static assets. */
export const getCdn = () => getEnv('CDN');

/** Reads the UI origin used for browser assets. */
export const getUi = () => getEnv('UI');
