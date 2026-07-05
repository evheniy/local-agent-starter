import { server } from '@vyriy/server';
import { api } from '@vyriy/handler';
import { createRouter } from '@vyriy/router';
import { minify, html } from '@vyriy/html';
import { html as react } from '@vyriy/render';

import { ProfileCard } from '@p/components/profile-card';
import { getUi } from '@p/env';

server(
  api(async (event) =>
    createRouter()
      .get('/', () => ({
        body: minify(
          html({
            htmlAttributes: 'lang="en"',
            title: '<title>Demo</title>',
            meta: '<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />',
            link: `<link rel="stylesheet" type="text/css" href="${getUi()}/main.css" />`,
            body: `<div id="root" rendered>${react(
              <ProfileCard
                name="Developer"
                title="Senior IT Professional"
                avatarUrl="http://localhost:3001/avatar.svg"
              />,
            )}</div>`,
            script: `<script defer="defer" src="${getUi()}/index.js"></script>`,
          }),
        ),
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'cache-control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
          'access-control-allow-origin': '*',
          'x-content-type-options': 'nosniff',
        },
      }))
      .route(event),
  ),
);
