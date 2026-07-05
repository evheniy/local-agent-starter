import type { ComponentProps, FC, ReactNode } from 'react';

/** Props for the IconLink component. */
export type IconLinkProps = {
  href: string;
  label: string;
  icon?: ReactNode;
  external?: boolean;
} & ComponentProps<'a'>;

/** IconLink component type. */
export type IconLinkType = FC<IconLinkProps>;
