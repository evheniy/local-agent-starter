import type { ComponentProps, FC, ReactNode } from 'react';

/** Props for the ButtonLink component. */
export type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
} & ComponentProps<'a'>;

/** ButtonLink component type. */
export type ButtonLinkType = FC<ButtonLinkProps>;
