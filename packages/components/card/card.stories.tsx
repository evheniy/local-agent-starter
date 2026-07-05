import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { Card } from './card.js';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: { docs: { page: null } },
  args: {
    title: 'Profile',
    subtitle: 'Calm reusable UI primitive',
    children: 'Card content',
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Muted: Story = { args: { variant: 'muted' } };

export const Highlighted: Story = { args: { variant: 'highlighted' } };
