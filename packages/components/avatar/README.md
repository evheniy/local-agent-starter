# Avatar

`Avatar` renders a profile image or deterministic initials fallback.

## Usage

```tsx
import { Avatar } from './avatar.js';

export const Example = () => <Avatar name="Ada Lovelace" />;
```

## Props

```ts
export type AvatarProps = {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
} & ComponentProps<'div'>;
```

## Accessibility

Image avatars receive useful alt text. Initials are decorative and hidden from assistive technology.

## Notes

- SSR/SSG-safe.
- No browser-only APIs.
- Shared SCSS styles.
