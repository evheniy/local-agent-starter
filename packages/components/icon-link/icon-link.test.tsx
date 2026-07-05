import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { IconLink } from './icon-link.js';

describe('IconLink', () => {
  it('renders readable link label', () => {
    render(<IconLink href="/github" label="GitHub" icon={<span>G</span>} />);

    expect(screen.getByRole('link', { name: 'GitHub' })).toBeDefined();
  });

  it('adds external link attributes', () => {
    render(<IconLink external href="https://example.com" label="Website" />);

    const link = screen.getByRole('link', { name: 'Website' });

    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noreferrer');
  });
});
