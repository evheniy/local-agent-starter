# Card

`Card` is a small layout primitive for profile-card UI surfaces.

## Usage

```tsx
import { Card } from './card.js';

export const Example = () => (
  <Card title="Profile" subtitle="Calm architecture">
    Content
  </Card>
);
```

## Props

```ts
export type CardProps = {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  variant?: 'default' | 'muted' | 'highlighted';
} & ComponentProps<'div'>;
```

## Notes

- SSR/SSG-safe.
- Root element accepts regular `div` props.
- Styles are local to the component.
