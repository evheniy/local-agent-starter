import config from '@vyriy/storybook-config';
import { path } from '@vyriy/path';

export default {
  ...config,
  stories: [
    path('.storybook/doc.mdx'),
    path('docs/*.mdx'),
    path('workspaces/**/*.mdx'),
    path('workspaces/**/*.stories.@(js|jsx|mjs|ts|tsx)'),
    path('packages/**/*.mdx'),
    path('packages/**/*.stories.@(js|jsx|mjs|ts|tsx)'),
  ],
};
