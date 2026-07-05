import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ProfileCard } from './profile-card.js';

describe('ProfileCard', () => {
  it('renders composed profile content', () => {
    render(
      <ProfileCard
        name="Developer"
        title="Senior IT Professional"
        description="Building calm architecture."
        tags={['React', 'TypeScript']}
        meta={[{ label: 'Project', value: 'Vyriy' }]}
        links={[{ href: 'https://vyriy.dev', label: 'Website', external: true }]}
      >
        Custom summary
      </ProfileCard>,
    );

    expect(screen.getByRole('article')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Developer' })).toBeDefined();
    expect(screen.getByText('Senior IT Professional')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('Vyriy')).toBeDefined();
    expect(screen.getByText('Custom summary')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Website' })).toBeDefined();
  });

  it('passes article props to the root element', () => {
    render(<ProfileCard name="Developer" data-testid="profile-card" />);

    expect(screen.getByTestId('profile-card')).toBeDefined();
  });
});
