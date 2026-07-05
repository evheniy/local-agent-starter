import type { Meta, StoryObj } from '@storybook/react-webpack5';

import { FileUploadPanel } from './file-upload-panel.js';

const meta = {
  title: 'Components/FileUploadPanel',
  component: FileUploadPanel,
  parameters: { docs: { page: null } },
  args: { status: 'idle' },
} satisfies Meta<typeof FileUploadPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Uploading: Story = { args: { status: 'uploading' } };

export const Success: Story = { args: { status: 'success' } };

export const Error: Story = {
  args: {
    status: 'error',
    error: 'The file could not be uploaded.',
  },
};
