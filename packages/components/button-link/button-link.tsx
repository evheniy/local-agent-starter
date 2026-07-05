import { cn } from '@vyriy/cn';

import type { ButtonLinkType } from './types.js';

/** Renders an anchor styled as a button. */
export const ButtonLink: ButtonLinkType = ({
  href,
  children,
  variant = 'primary',
  external = false,
  className,
  ...props
}) => {
  return (
    <a
      className={cn('button-link', `button-link--${variant}`, className)}
      href={href}
      target={external ? '_blank' : props.target}
      rel={external ? 'noreferrer' : props.rel}
      {...props}
    >
      {children}
    </a>
  );
};
