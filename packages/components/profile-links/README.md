# ProfileLinks

`ProfileLinks` renders profile links as compact text links or button links.

## Usage

```tsx
import { ProfileLinks } from './profile-links.js';

export const Example = () => <ProfileLinks links={[{ href: '/github', label: 'GitHub' }]} />;
```

## Props

```ts
export type ProfileLink = {
  href: string;
  label: string;
  external?: boolean;
};

export type ProfileLinksProps = {
  links: ProfileLink[];
  variant?: 'icons' | 'buttons';
} & ComponentProps<'nav'>;
```

## Accessibility

The component renders `<nav aria-label="Profile links">` by default.

## Notes

- Empty link arrays render `null`.
- External links receive safe target and rel attributes.
- SSR/SSG-safe.
