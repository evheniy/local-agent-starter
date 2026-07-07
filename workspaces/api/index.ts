import { server } from '@vyriy/server';
import { api } from '@vyriy/handler';
import { createRouter } from '@vyriy/router';
import { path } from '@vyriy/path';
import { withStatic } from '@vyriy/static';

import { files, html, upload } from '@p/api';

server(
  api(async (event) =>
    withStatic(createRouter())
      .get('/', html)
      .get('/files', files)
      .post('/upload', upload)
      .static('/static', path('static'), { cache: 'static' })
      .route(event),
  ),
);
