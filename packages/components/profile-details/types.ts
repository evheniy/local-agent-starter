import type { ComponentProps, FC, ReactNode } from 'react';

/** Props for the ProfileDetails component. */
export type ProfileDetailsProps = {
  children?: ReactNode;
} & ComponentProps<'section'>;

/** ProfileDetails component type. */
export type ProfileDetailsType = FC<ProfileDetailsProps>;
