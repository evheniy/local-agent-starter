import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ProfileLinks } from './profile-links.js';

describe('ProfileLinks', () => {
  it('renders profile links in navigation', () => {
    render(<ProfileLinks links={[{ href: '/github', label: 'GitHub' }]} />);

    expect(screen.getByRole('navigation', { name: 'Profile links' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeDefined();
  });

  it('renders external button links', () => {
    render(
      <ProfileLinks links={[{ href: 'https://example.com', label: 'Website', external: true }]} variant="buttons" />,
    );

    const link = screen.getByRole('link', { name: 'Website' });

    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });

  it('does not render an empty wrapper', () => {
    const { container } = render(<ProfileLinks links={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
