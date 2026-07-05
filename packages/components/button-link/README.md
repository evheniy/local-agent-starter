# ButtonLink

`ButtonLink` keeps native anchor semantics while using button-like styling.

## Usage

```tsx
import { ButtonLink } from './button-link.js';

export const Example = () => <ButtonLink href="/profile">Open profile</ButtonLink>;
```

## Props

```ts
export type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  external?: boolean;
} & ComponentProps<'a'>;
```

## Accessibility

The component renders a native `<a>`. External links receive `target="_blank"` and `rel="noreferrer"`.

## Notes

- SSR/SSG-safe.
- Visible focus style.
- Shared SCSS styles.
