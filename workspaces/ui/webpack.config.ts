import { EnvironmentPlugin } from 'webpack';

import { csr, html } from '@vyriy/webpack-config';
import { path } from '@vyriy/path';

export default csr(
  '@w/ui',
  {
    path: path('dist', 'cdn'),
    filename: 'index.js',
  },
  (config) => ({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      new EnvironmentPlugin(['API', 'CDN', 'UI']),
      html({
        htmlAttributes: 'lang="en"',
        title: '<title>Demo</title>',
        meta: '<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />',
        body: '<div id="root"></div>',
      }),
    ],
  }),
);
