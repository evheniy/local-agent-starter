import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ProfileCard } from './profile-card.js';

const meta = {
  title: 'Components/ProfileCard',
  component: ProfileCard,
  parameters: { docs: { page: null } },
  args: {
    name: 'Developer',
    title: 'Senior IT Professional',
    description: 'Building calm architecture for cloud-ready applications.',
    tags: [
      'React',
      'TypeScript',
      'AWS',
      'Serverless',
      'Vyriy',
    ],
    meta: [
      { label: 'Project', value: 'Vyriy' },
      { label: 'Focus', value: 'Calm architecture' },
    ],
    links: [
      { label: 'GitHub', href: 'https://github.com', external: true },
      { label: 'Website', href: 'https://vyriy.dev', external: true },
    ],
    children: <p>Reusable profile UI for MFE preset examples.</p>,
  },
} satisfies Meta<typeof ProfileCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Minimal: Story = {
  args: {
    title: undefined,
    description: undefined,
    tags: [],
    meta: [],
    links: [],
    children: undefined,
  },
};
