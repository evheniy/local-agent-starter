import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ProfileLinks } from './profile-links.js';

const meta = {
  title: 'Components/ProfileLinks',
  component: ProfileLinks,
  parameters: { docs: { page: null } },
  args: {
    links: [
      { label: 'GitHub', href: 'https://github.com', external: true },
      { label: 'Website', href: 'https://vyriy.dev', external: true },
    ],
  },
} satisfies Meta<typeof ProfileLinks>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Buttons: Story = { args: { variant: 'buttons' } };
