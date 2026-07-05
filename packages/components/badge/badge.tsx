import { cn } from '@vyriy/cn';

import type { BadgeType } from './types.js';

/** Renders a compact tone-aware label. */
export const Badge: BadgeType = ({ children, tone = 'neutral', className, ...props }) => {
  return (
    <span className={cn('badge', `badge--${tone}`, className)} {...props}>
      {children}
    </span>
  );
};
