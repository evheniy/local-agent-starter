# IconLink

`IconLink` renders a compact profile link with optional decorative icon content.

## Usage

```tsx
import { IconLink } from './icon-link.js';

export const Example = () => <IconLink href="/github" label="GitHub" />;
```

## Props

```ts
export type IconLinkProps = {
  href: string;
  label: string;
  icon?: ReactNode;
  external?: boolean;
} & ComponentProps<'a'>;
```

## Accessibility

The label remains readable link text. Optional icon content is decorative.

## Notes

- SSR/SSG-safe.
- External links receive safe target and rel attributes.
- Shared SCSS styles.
