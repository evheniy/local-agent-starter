import type { ComponentProps, FC, ReactNode } from 'react';

/** Props for the Badge component. */
export type BadgeProps = {
  children: ReactNode;
  tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red';
} & ComponentProps<'span'>;

/** Badge component type. */
export type BadgeType = FC<BadgeProps>;
