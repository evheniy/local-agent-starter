import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { Card } from './card.js';

describe('Card', () => {
  it('renders title, subtitle, and children', () => {
    render(
      <Card title="Profile" subtitle="Frontend engineer">
        <span>Content</span>
      </Card>,
    );

    expect(screen.getByRole('heading', { name: 'Profile' })).toBeDefined();
    expect(screen.getByText('Frontend engineer')).toBeDefined();
    expect(screen.getByText('Content')).toBeDefined();
  });

  it('passes div props to the root element', () => {
    render(<Card title="Profile" data-testid="card-root" />);

    expect(screen.getByTestId('card-root')).toBeDefined();
  });
});
