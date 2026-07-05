import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ButtonLink } from './button-link.js';

const meta = {
  title: 'Components/ButtonLink',
  component: ButtonLink,
  parameters: { docs: { page: null } },
  args: { href: '#', children: 'Open profile', variant: 'primary' },
} satisfies Meta<typeof ButtonLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Secondary: Story = { args: { variant: 'secondary' } };

export const Ghost: Story = { args: { variant: 'ghost' } };
