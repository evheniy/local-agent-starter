# ProfileDetails

`ProfileDetails` renders optional profile summary, skills, or custom body content.

## Usage

```tsx
import { ProfileDetails } from './profile-details.js';

export const Example = () => <ProfileDetails>Profile summary</ProfileDetails>;
```

## Props

```ts
export type ProfileDetailsProps = {
  children?: ReactNode;
} & ComponentProps<'section'>;
```

## Accessibility

The component renders a semantic `<section>` when content exists.

## Notes

- Empty content renders `null`.
- SSR/SSG-safe.
- Shared SCSS styles.
