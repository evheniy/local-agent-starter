import type { Handler } from '@vyriy/router';

import { minify, html as render } from '@vyriy/html';
import { html as react } from '@vyriy/render';

import { AgentShell } from '@p/components/agent-shell';
import { getUi } from '@p/env';

export const html: Handler = () => ({
  body: minify(
    render({
      htmlAttributes: 'lang="en"',
      title: '<title>Local Agent Starter</title>',
      meta: '<meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />',
      link: `<link rel="stylesheet" type="text/css" href="${getUi()}/main.css" />`,
      body: `<div id="root" rendered>${react(
        <AgentShell
          tab="chat"
          chatPanel={{
            answer: 'This placeholder answer will later be streamed from the local chat service.',
            question: 'What does this project already know about pgvector?',
          }}
          uploadPanel={{}}
        />,
      )}</div>`,
      script: `<script defer="defer" src="${getUi()}/index.js"></script>`,
    }),
  ),
  headers: {
    'content-type': 'text/html; charset=utf-8',
    'access-control-allow-origin': '*',
    'x-content-type-options': 'nosniff',
  },
});
