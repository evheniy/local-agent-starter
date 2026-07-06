import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ChatPanel } from './chat-panel.js';

const meta = {
  title: 'Components/ChatPanel',
  component: ChatPanel,
  parameters: { docs: { page: null } },
  args: {
    question: 'What has been indexed?',
    answer: 'This placeholder answer is ready to be replaced by streamed API output.',
  },
} satisfies Meta<typeof ChatPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    question: '',
    answer: undefined,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Error: Story = {
  args: {
    error: 'The local agent API is not available.',
  },
};
