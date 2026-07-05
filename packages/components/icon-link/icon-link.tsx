import { cn } from '@vyriy/cn';

import type { IconLinkType } from './types.js';

/** Renders a compact accessible link with an optional decorative icon. */
export const IconLink: IconLinkType = ({ href, label, icon, external = false, className, ...props }) => {
  return (
    <a
      className={cn('icon-link', className)}
      href={href}
      target={external ? '_blank' : props.target}
      rel={external ? 'noreferrer' : props.rel}
      {...props}
    >
      {icon && (
        <span className="icon-link__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="icon-link__label">{label}</span>
    </a>
  );
};
