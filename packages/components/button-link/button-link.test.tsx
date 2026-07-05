import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ButtonLink } from './button-link.js';

describe('ButtonLink', () => {
  it('renders a native link', () => {
    render(<ButtonLink href="/profile">Open profile</ButtonLink>);

    expect(screen.getByRole('link', { name: 'Open profile' }).getAttribute('href')).toBe('/profile');
  });

  it('adds external link attributes', () => {
    render(
      <ButtonLink external href="https://example.com">
        Website
      </ButtonLink>,
    );

    const link = screen.getByRole('link', { name: 'Website' });

    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });
});
