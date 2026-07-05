import { cn } from '@vyriy/cn';

import type { AvatarType } from './types.js';

const getInitials = (name?: string) => {
  if (!name) {
    return '?';
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || '?';
};

/** Renders either a profile image or deterministic initials fallback. */
export const Avatar: AvatarType = ({ src, alt, name, size = 'md', className, ...props }) => {
  return (
    <div className={cn('avatar', `avatar--${size}`, className)} {...props}>
      {src ? (
        <img className="avatar__image" alt={alt ?? name ?? 'Profile avatar'} src={src} />
      ) : (
        <span className="avatar__initials" aria-hidden="true">
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
