import type { ComponentProps, FC } from 'react';

import type { BadgeProps } from '../badge/index.js';

/** Props for the ProfileTags component. */
export type ProfileTagsProps = {
  tags: string[];
  tone?: BadgeProps['tone'];
} & ComponentProps<'ul'>;

/** ProfileTags component type. */
export type ProfileTagsType = FC<ProfileTagsProps>;
