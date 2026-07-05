import type { ComponentProps, FC } from 'react';

/** Props for the ProfileHeader component. */
export type ProfileHeaderProps = {
  name: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
} & ComponentProps<'header'>;

/** ProfileHeader component type. */
export type ProfileHeaderType = FC<ProfileHeaderProps>;
