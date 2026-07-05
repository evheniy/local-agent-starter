import type { ComponentProps, FC, ReactNode } from 'react';

/** Props for the Card component. */
export type CardProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  variant?: 'default' | 'muted' | 'highlighted';
} & ComponentProps<'div'>;

/** Card component type. */
export type CardType = FC<CardProps>;
