import type { ComponentProps, FC, ReactNode } from 'react';

/** Metadata item rendered by ProfileMeta. */
export type ProfileMetaItem = {
  label: string;
  value: ReactNode;
};

/** Props for the ProfileMeta component. */
export type ProfileMetaProps = {
  items: ProfileMetaItem[];
} & ComponentProps<'dl'>;

/** ProfileMeta component type. */
export type ProfileMetaType = FC<ProfileMetaProps>;
