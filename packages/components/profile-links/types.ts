import type { ComponentProps, FC } from 'react';

/** Link item rendered by ProfileLinks. */
export type ProfileLink = {
  href: string;
  label: string;
  external?: boolean;
};

/** Props for the ProfileLinks component. */
export type ProfileLinksProps = {
  links: ProfileLink[];
  variant?: 'icons' | 'buttons';
} & ComponentProps<'nav'>;

/** ProfileLinks component type. */
export type ProfileLinksType = FC<ProfileLinksProps>;
