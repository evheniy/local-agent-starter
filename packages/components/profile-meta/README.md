# ProfileMeta

`ProfileMeta` renders compact metadata rows for location, company, availability, and stack.

## Usage

```tsx
import { ProfileMeta } from './profile-meta.js';

export const Example = () => <ProfileMeta items={[{ label: 'Project', value: 'Vyriy' }]} />;
```

## Props

```ts
export type ProfileMetaItem = {
  label: string;
  value: ReactNode;
};

export type ProfileMetaProps = {
  items: ProfileMetaItem[];
} & ComponentProps<'dl'>;
```

## Accessibility

The component uses semantic `<dl>`, `<dt>`, and `<dd>` markup.

## Notes

- Empty item arrays render `null`.
- SSR/SSG-safe.
- Shared SCSS styles.
