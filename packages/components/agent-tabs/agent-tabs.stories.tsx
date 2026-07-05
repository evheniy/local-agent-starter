import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { AgentTabs } from './agent-tabs.js';

const meta = {
  title: 'Components/AgentTabs',
  component: AgentTabs,
  parameters: { docs: { page: null } },
  args: { value: 'chat' },
} satisfies Meta<typeof AgentTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Upload: Story = { args: { value: 'upload' } };
