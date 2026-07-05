import { cn } from '@vyriy/cn';

import { Card } from '../card/index.js';
import { ProfileDetails } from '../profile-details/index.js';
import { ProfileHeader } from '../profile-header/index.js';
import { ProfileLinks } from '../profile-links/index.js';
import { ProfileMeta } from '../profile-meta/index.js';
import { ProfileTags } from '../profile-tags/index.js';
import type { ProfileCardType } from './types.js';

/** Composes the profile-card primitives into one semantic article. */
export const ProfileCard: ProfileCardType = ({
  name,
  title,
  description,
  avatarUrl,
  tags = [],
  meta = [],
  links = [],
  children,
  className,
  ...props
}) => {
  return (
    <article className={cn('profile-card', className)} {...props}>
      <Card>
        <div className="profile-card__content">
          <ProfileHeader avatarUrl={avatarUrl} description={description} name={name} title={title} />
          <ProfileMeta items={meta} />
          <ProfileTags tags={tags} tone="blue" />
          <ProfileDetails>{children}</ProfileDetails>
          <ProfileLinks links={links} />
        </div>
      </Card>
    </article>
  );
};
