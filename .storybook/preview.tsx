import '@p/components/styles.scss';

import type { Preview } from '@storybook/react-webpack5';

import preview from '@vyriy/storybook-config/preview';

export default {
  ...preview,
  parameters: {
    ...preview.parameters,
    options: {
      storySort: {
        method: 'alphabetical',
        order: [
          'Local Agent Starter',
          'Docs',
          'Workspaces',
          'Packages',
          'Components',
        ],
      },
    },
  },
} satisfies Preview;
