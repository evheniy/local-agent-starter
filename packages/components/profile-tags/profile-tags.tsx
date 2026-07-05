import { cn } from '@vyriy/cn';

import { Badge } from '../badge/index.js';
import type { ProfileTagsType } from './types.js';

/** Renders profile tags as a semantic list of badges. */
export const ProfileTags: ProfileTagsType = ({ tags, tone = 'neutral', className, ...props }) => {
  if (tags.length === 0) {
    return null;
  }

  return (
    <ul className={cn('profile-tags', className)} {...props}>
      {tags.map((tag) => (
        <li className="profile-tags__item" key={tag}>
          <Badge tone={tone}>{tag}</Badge>
        </li>
      ))}
    </ul>
  );
};
