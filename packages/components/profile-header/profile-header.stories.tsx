import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ProfileHeader } from './profile-header.js';

const meta = {
  title: 'Components/ProfileHeader',
  component: ProfileHeader,
  parameters: { docs: { page: null } },
  args: {
    name: 'Developer',
    title: 'Senior IT Professional',
    description: 'Building calm architecture for cloud-ready applications.',
  },
} satisfies Meta<typeof ProfileHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAvatar: Story = {
  args: {
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80',
  },
};
