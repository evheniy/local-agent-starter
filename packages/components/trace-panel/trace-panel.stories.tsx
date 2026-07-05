import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { TracePanel } from './trace-panel.js';

const meta = {
  title: 'Components/TracePanel',
  component: TracePanel,
  parameters: { docs: { page: null } },
  args: {
    events: [
      {
        id: 'receive',
        title: 'Question received',
        description: 'The app accepted the user question.',
        status: 'done',
      },
      {
        id: 'retrieve',
        title: 'Retrieve context',
        description: 'Search indexed chunks through pgvector.',
        status: 'running',
        metadata: { chunks: 2 },
      },
    ],
  },
} satisfies Meta<typeof TracePanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSampleData: Story = {};

export const Empty: Story = { args: { events: [] } };

export const Error: Story = {
  args: {
    events: [
      {
        id: 'error',
        title: 'Retrieve context',
        description: 'Vector search failed.',
        status: 'error',
      },
    ],
  },
};
