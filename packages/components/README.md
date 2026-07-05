# Components

Reusable React components for the profile-card demo. The package is private to
this repository and is consumed by the API and UI workspaces.

## Exports

Import the full public surface from `@p/components`:

- `Avatar`
- `Badge`
- `ButtonLink`
- `Card`
- `IconLink`
- `ProfileCard`
- `ProfileDetails`
- `ProfileHeader`
- `ProfileLinks`
- `ProfileMeta`
- `ProfileTags`

Focused component entry points are also available:

```tsx
import { ProfileCard } from '@p/components/profile-card';
```

## Usage

```tsx
import { ProfileCard } from '@p/components/profile-card';
import '@p/components/styles.scss';

export const Example = () => (
  <ProfileCard
    name="Developer"
    title="Senior IT Professional"
    description="Building calm architecture for cloud-ready applications."
    avatarUrl="http://localhost:3001/avatar.svg"
    tags={['React', 'TypeScript', 'Vyriy']}
    meta={[{ label: 'Project', value: 'Fullstack preset' }]}
    links={[{ href: 'https://vyriy.dev', label: 'Website', external: true }]}
  />
);
```

## Structure

Each public component lives in its own folder with:

- a focused `README.md`
- Storybook docs in `doc.mdx`
- stories for visual states
- behavior tests and public entry-point tests
- component-local SCSS

The package-level `index.ts` is a re-export surface only.

## Notes

- Components are SSR/SSG-friendly and avoid browser globals during render.
- Shared styles are exposed through `@p/components/styles.scss`.
- Public imports use ESM `.js` relative specifiers in TypeScript source.
