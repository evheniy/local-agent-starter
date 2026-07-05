import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Avatar } from './avatar.js';
import avatar from '../../../workspaces/static/public/avatar.svg';

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  parameters: { docs: { page: null } },
  args: { name: 'Ada Lovelace', size: 'md' },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Image: Story = {
  args: {
    src: avatar,
    alt: 'Profile portrait',
  },
};

export const Large: Story = { args: { size: 'lg' } };
