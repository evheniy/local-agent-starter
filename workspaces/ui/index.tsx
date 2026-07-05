import { element } from '@vyriy/render/element';

import { ProfileCard } from '@p/components/profile-card';
import '@p/components/styles.scss';

element({
  root: document.getElementById('root'),
  component: (
    <ProfileCard name="Developer" title="Senior IT Professional" avatarUrl="http://localhost:3001/avatar.svg" />
  ),
});
