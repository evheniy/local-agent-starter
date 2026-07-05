# ProfileCard

`ProfileCard` composes the profile-card primitives into one semantic article.

## Usage

```tsx
import { ProfileCard } from './profile-card.js';

export const Example = () => (
  <ProfileCard
    name="Developer"
    title="Senior IT Professional"
    description="Building calm architecture for cloud-ready applications."
    tags={['React', 'TypeScript', 'Vyriy']}
    meta={[{ label: 'Project', value: 'Vyriy' }]}
    links={[{ href: 'https://vyriy.dev', label: 'Website', external: true }]}
  />
);
```

## Props

```ts
export type ProfileCardProps = {
  name: string;
  title?: string;
  description?: string;
  avatarUrl?: string;
  tags?: string[];
  meta?: ProfileCardMetaItem[];
  links?: ProfileCardLink[];
  children?: ReactNode;
} & ComponentProps<'article'>;
```

## Accessibility

The root element is an `<article>`. Nested metadata, tag, and link sections use semantic markup.

## Notes

- SSR/SSG-safe.
- Deterministic output.
- Shared SCSS styles.
