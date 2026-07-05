import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ProfileTags } from './profile-tags.js';

describe('ProfileTags', () => {
  it('renders tags as a list', () => {
    render(<ProfileTags tags={['React', 'TypeScript']} />);

    expect(screen.getByRole('list')).toBeDefined();
    expect(screen.getByText('React')).toBeDefined();
    expect(screen.getByText('TypeScript')).toBeDefined();
  });

  it('does not render an empty wrapper', () => {
    const { container } = render(<ProfileTags tags={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
