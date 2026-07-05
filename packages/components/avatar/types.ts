import type { ComponentProps, FC } from 'react';

/** Props for the Avatar component. */
export type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
} & ComponentProps<'div'>;

/** Avatar component type. */
export type AvatarType = FC<AvatarProps>;
