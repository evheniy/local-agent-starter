import { cn } from '@vyriy/cn';

import { ButtonLink } from '../button-link/index.js';
import { IconLink } from '../icon-link/index.js';
import type { ProfileLinksType } from './types.js';

/** Renders profile links as icon links or button-style links. */
export const ProfileLinks: ProfileLinksType = ({
  links,
  variant = 'icons',
  className,
  'aria-label': ariaLabel = 'Profile links',
  ...props
}) => {
  if (links.length === 0) {
    return null;
  }

  return (
    <nav className={cn('profile-links', `profile-links--${variant}`, className)} aria-label={ariaLabel} {...props}>
      {links.map((link) =>
        variant === 'buttons' ? (
          <ButtonLink external={link.external} href={link.href} key={link.href} variant="secondary">
            {link.label}
          </ButtonLink>
        ) : (
          <IconLink external={link.external} href={link.href} key={link.href} label={link.label} />
        ),
      )}
    </nav>
  );
};
