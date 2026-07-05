# Badge

`Badge` displays compact labels for tags, roles, and statuses.

## Usage

```tsx
import { Badge } from './badge.js';

export const Example = () => <Badge tone="green">Available</Badge>;
```

## Props

```ts
export type BadgeProps = {
  children: ReactNode;
  tone?: 'neutral' | 'blue' | 'green' | 'amber' | 'red';
} & ComponentProps<'span'>;
```

## Notes

- SSR/SSG-safe.
- Root element accepts regular `span` props.
- Shared SCSS styles with tone variants.
