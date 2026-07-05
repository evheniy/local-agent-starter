import { cn } from '@vyriy/cn';

import type { ProfileMetaType } from './types.js';

/** Renders profile metadata as a semantic description list. */
export const ProfileMeta: ProfileMetaType = ({ items, className, ...props }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <dl className={cn('profile-meta', className)} {...props}>
      {items.map((item) => (
        <div className="profile-meta__item" key={item.label}>
          <dt className="profile-meta__label">{item.label}</dt>
          <dd className="profile-meta__value">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
};
