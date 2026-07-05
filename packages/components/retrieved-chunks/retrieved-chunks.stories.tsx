import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { RetrievedChunks } from './retrieved-chunks.js';

const meta = {
  title: 'Components/RetrievedChunks',
  component: RetrievedChunks,
  parameters: { docs: { page: null } },
  args: {
    chunks: [
      {
        id: 'chunk-1',
        title: 'Concepts',
        path: 'docs/concepts.md',
        content: 'RAG retrieves context before generation.',
        score: 0.91,
      },
    ],
  },
} satisfies Meta<typeof RetrievedChunks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSampleData: Story = {};

export const Empty: Story = { args: { chunks: [] } };
