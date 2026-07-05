import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ProfileDetails } from './profile-details.js';

describe('ProfileDetails', () => {
  it('renders body content', () => {
    render(
      <ProfileDetails>
        <p>Profile summary</p>
      </ProfileDetails>,
    );

    expect(screen.getByText('Profile summary')).toBeDefined();
  });

  it('does not render an empty wrapper', () => {
    const { container } = render(<ProfileDetails />);

    expect(container.firstChild).toBeNull();
  });
});
