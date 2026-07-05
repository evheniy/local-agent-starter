import type { ComponentProps, FC, ReactNode } from 'react';

/** Link item rendered in a profile card. */
export type ProfileCardLink = {
  href: string;
  label: string;
  external?: boolean;
};

/** Metadata item rendered in a profile card. */
export type ProfileCardMetaItem = {
  label: string;
  value: ReactNode;
};

/** Data model accepted by the ProfileCard component and API renderers. */
export type ProfileCard = {
  name: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
  tags?: string[];
  meta?: ProfileCardMetaItem[];
  links?: ProfileCardLink[];
  children?: ReactNode;
};

/** Props for the ProfileCard component. */
export type ProfileCardProps = ProfileCard & ComponentProps<'article'>;

/** ProfileCard component type. */
export type ProfileCardType = FC<ProfileCardProps>;
