import { server } from '@vyriy/server';
import { api } from '@vyriy/handler';
import { createRouter } from '@vyriy/router';
import { path } from '@vyriy/path';
import { useStatic as createStaticAssetHandler, withStatic } from '@vyriy/static';

import { chat, files, html, indexFile, upload } from '@p/api';

const staticAssets = createStaticAssetHandler(path('static'), { cache: 'static' });

server(
  api(async (event) =>
    withStatic(createRouter())
      .get('/', html)
      .get('/files', files)
      .get('/static/:file', ({ event, pathParameters }) =>
        staticAssets(
          {
            ...event,
            path: `/${pathParameters!.file}`,
          },
          {} as never,
        ),
      )
      .post('/chat', chat)
      .post('/files/:id/index', indexFile)
      .post('/upload', upload)
      .static('/static', path('static'), { cache: 'static' })
      .route(event),
  ),
);
