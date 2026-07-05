import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { IndexedFilesList } from './indexed-files-list.js';

const meta = {
  title: 'Components/IndexedFilesList',
  component: IndexedFilesList,
  parameters: { docs: { page: null } },
  args: {
    files: [
      {
        id: 'file-1',
        name: 'concepts.md',
        size: 2048,
        type: 'text/markdown',
        status: 'indexed',
        chunksCount: 6,
      },
      {
        id: 'file-2',
        name: 'architecture.md',
        size: 1536,
        type: 'text/markdown',
        status: 'indexing',
      },
    ],
  },
} satisfies Meta<typeof IndexedFilesList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithSampleData: Story = {};

export const Empty: Story = { args: { files: [] } };

export const Error: Story = {
  args: {
    files: [
      {
        id: 'file-error',
        name: 'broken.pdf',
        status: 'error',
      },
    ],
  },
};
