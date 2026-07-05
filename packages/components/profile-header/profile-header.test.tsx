import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ProfileHeader } from './profile-header.js';

describe('ProfileHeader', () => {
  it('renders name, title, and description', () => {
    render(
      <ProfileHeader
        name="Ada Lovelace"
        title="Computing pioneer"
        description="Wrote early notes about general computation."
      />,
    );

    expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeDefined();
    expect(screen.getByText('Computing pioneer')).toBeDefined();
    expect(screen.getByText('Wrote early notes about general computation.')).toBeDefined();
  });

  it('passes header props to the root element', () => {
    render(<ProfileHeader name="Ada Lovelace" data-testid="profile-header" />);

    expect(screen.getByTestId('profile-header')).toBeDefined();
  });
});
