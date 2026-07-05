import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Badge } from './badge.js';

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: { docs: { page: null } },
  args: { children: 'React', tone: 'neutral' },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = { args: { tone: 'blue' } };

export const Green: Story = { args: { tone: 'green', children: 'Available' } };

export const Amber: Story = { args: { tone: 'amber', children: 'Maintainer' } };

export const Red: Story = { args: { tone: 'red', children: 'Busy' } };
