import { EnvironmentPlugin } from 'webpack';
import { path } from '@vyriy/path';
import { ssr, external } from '@vyriy/webpack-config';

export default ssr(
  '@w/api',
  {
    path: path('dist', 'api'),
    filename: 'index.js',
    library: { type: 'commonjs2' },
  },
  (config) => ({
    ...config,
    externals: [external({ allowlist: [/^@p/, /^@w/, /^@vyriy/] })],
    plugins: [
      ...(config.plugins ?? []),
      new EnvironmentPlugin([
        'API',
        'CDN',
        'UI',
      ]),
    ],
  }),
);
