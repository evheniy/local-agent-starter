# ProfileTags

`ProfileTags` renders a list of profile tags using `Badge`.

## Usage

```tsx
import { ProfileTags } from './profile-tags.js';

export const Example = () => <ProfileTags tags={['React', 'TypeScript']} />;
```

## Props

```ts
export type ProfileTagsProps = {
  tags: string[];
  tone?: BadgeProps['tone'];
} & ComponentProps<'ul'>;
```

## Accessibility

Tags are rendered as a semantic `<ul>` with one `<li>` per tag.

## Notes

- Empty tag arrays render `null`.
- SSR/SSG-safe.
- Shared SCSS styles.
