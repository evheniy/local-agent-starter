import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

import { Badge } from './badge.js';

describe('Badge', () => {
  it('renders label content', () => {
    render(<Badge tone="green">Available</Badge>);

    expect(screen.getByText('Available')).toBeDefined();
  });

  it('passes span props to the root element', () => {
    render(<Badge data-testid="badge-root">React</Badge>);

    expect(screen.getByTestId('badge-root')).toBeDefined();
  });
});
