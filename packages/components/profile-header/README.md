# ProfileHeader

`ProfileHeader` composes an avatar, name, title, and short description.

## Usage

```tsx
import { ProfileHeader } from './profile-header.js';

export const Example = () => <ProfileHeader name="Developer" title="Senior IT Professional" />;
```

## Props

```ts
export type ProfileHeaderProps = {
  name: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
} & ComponentProps<'header'>;
```

## Accessibility

The root element is a semantic `<header>`, and avatar alt text is derived from the profile name.

## Notes

- SSR/SSG-safe.
- Deterministic rendering.
- Shared SCSS styles.
