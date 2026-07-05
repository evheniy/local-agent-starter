import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { ProfileMeta } from './profile-meta.js';

describe('ProfileMeta', () => {
  it('renders metadata in a description list', () => {
    render(<ProfileMeta items={[{ label: 'Location', value: 'Kyiv' }]} />);

    expect(screen.getByText('Location')).toBeDefined();
    expect(screen.getByText('Kyiv')).toBeDefined();
  });

  it('does not render an empty wrapper', () => {
    const { container } = render(<ProfileMeta items={[]} />);

    expect(container.firstChild).toBeNull();
  });
});
