import { cn } from '@vyriy/cn';

import { Avatar } from '../avatar/index.js';
import type { ProfileHeaderType } from './types.js';

/** Renders profile identity, title, description, and avatar. */
export const ProfileHeader: ProfileHeaderType = ({ name, title, description, avatarUrl, className, ...props }) => {
  return (
    <header className={cn('profile-header', className)} {...props}>
      <Avatar src={avatarUrl} name={name} alt={`${name} avatar`} size="lg" />
      <div className="profile-header__content">
        <h2 className="profile-header__name">{name}</h2>
        {title && <p className="profile-header__title">{title}</p>}
        {description && <p className="profile-header__description">{description}</p>}
      </div>
    </header>
  );
};
