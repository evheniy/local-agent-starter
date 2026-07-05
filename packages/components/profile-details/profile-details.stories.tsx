import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { ProfileDetails } from './profile-details.js';

const meta = {
  title: 'Components/ProfileDetails',
  component: ProfileDetails,
  parameters: { docs: { page: null } },
  args: { children: <p>Builds typed, deployable systems with calm boundaries.</p> },
} satisfies Meta<typeof ProfileDetails>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
