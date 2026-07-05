import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { IconLink } from './icon-link.js';

const meta = {
  title: 'Components/IconLink',
  component: IconLink,
  parameters: { docs: { page: null } },
  args: { href: '#', label: 'GitHub', icon: 'GH' },
} satisfies Meta<typeof IconLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const External: Story = {
  args: { href: 'https://example.com', label: 'Website', external: true },
};
