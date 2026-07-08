import config from '@vyriy/storybook-config';
import { path } from '@vyriy/path';

const staticDirs = Array.isArray(config.staticDirs) ? config.staticDirs : [];

export default {
  ...config,
  staticDirs: [
    ...staticDirs,
    {
      from: path('docs/screenshots'),
      to: '/screenshots',
    },
  ],
  stories: [
    path('.storybook/doc.mdx'),
    path('docs/*.mdx'),
    path('workspaces/**/*.mdx'),
    path('workspaces/**/*.stories.@(js|jsx|mjs|ts|tsx)'),
    path('packages/**/*.mdx'),
    path('packages/**/*.stories.@(js|jsx|mjs|ts|tsx)'),
  ],
};
