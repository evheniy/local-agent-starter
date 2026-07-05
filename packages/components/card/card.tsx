import { cn } from '@vyriy/cn';

import type { CardType } from './types.js';

/** Renders a small content surface with optional heading text. */
export const Card: CardType = ({ title, subtitle, children, variant = 'default', className, ...props }) => {
  return (
    <div className={cn('card', `card--${variant}`, className)} {...props}>
      {(title || subtitle) && (
        <header className="card__header">
          {title && <h2 className="card__title">{title}</h2>}
          {subtitle && <p className="card__subtitle">{subtitle}</p>}
        </header>
      )}

      {children && <div className="card__body">{children}</div>}
    </div>
  );
};
