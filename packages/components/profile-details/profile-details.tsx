import { cn } from '@vyriy/cn';

import type { ProfileDetailsType } from './types.js';

/** Renders optional long-form profile details. */
export const ProfileDetails: ProfileDetailsType = ({ children, className, ...props }) => {
  if (!children) {
    return null;
  }

  return (
    <section className={cn('profile-details', className)} {...props}>
      {children}
    </section>
  );
};
