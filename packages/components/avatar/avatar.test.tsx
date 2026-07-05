import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { Avatar } from './avatar.js';

describe('Avatar', () => {
  it('renders an image when src exists', () => {
    render(<Avatar src="/avatar.png" name="Ada Lovelace" />);

    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeDefined();
  });

  it('uses a generic image alt when name and alt are not provided', () => {
    render(<Avatar src="/avatar.png" />);

    expect(screen.getByRole('img', { name: 'Profile avatar' })).toBeDefined();
  });

  it('renders initials fallback without exposing decorative text', () => {
    render(<Avatar name="Ada Lovelace" data-testid="avatar-root" />);

    expect(screen.getByText('AL')).toBeDefined();
    expect(screen.getByText('AL').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('avatar-root')).toBeDefined();
  });

  it('renders a stable fallback when name is not provided', () => {
    render(<Avatar />);

    expect(screen.getByText('?')).toBeDefined();
  });

  it('renders a stable fallback when name has no initials', () => {
    render(<Avatar name="   " />);

    expect(screen.getByText('?')).toBeDefined();
  });
});
