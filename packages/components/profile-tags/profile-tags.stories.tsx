import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ProfileTags } from './profile-tags.js';

const meta = {
  title: 'Components/ProfileTags',
  component: ProfileTags,
  parameters: { docs: { page: null } },
  args: {
    tags: [
      'React',
      'TypeScript',
      'AWS',
      'Serverless',
    ],
    tone: 'blue',
  },
} satisfies Meta<typeof ProfileTags>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Neutral: Story = { args: { tone: 'neutral' } };
