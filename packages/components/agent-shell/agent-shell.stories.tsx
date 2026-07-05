import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { AgentShell } from './agent-shell.js';

const meta = {
  title: 'Components/AgentShell',
  component: AgentShell,
  parameters: { docs: { page: null } },
  args: { defaultTab: 'chat' },
} satisfies Meta<typeof AgentShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Chat: Story = {};

export const Upload: Story = { args: { defaultTab: 'upload' } };
