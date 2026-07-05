import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ProfileMeta } from './profile-meta.js';

const meta = {
  title: 'Components/ProfileMeta',
  component: ProfileMeta,
  parameters: { docs: { page: null } },
  args: {
    items: [
      { label: 'Project', value: 'Vyriy' },
      { label: 'Focus', value: 'Calm architecture' },
    ],
  },
} satisfies Meta<typeof ProfileMeta>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
