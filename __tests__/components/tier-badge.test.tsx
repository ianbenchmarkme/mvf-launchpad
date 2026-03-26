import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TierBadge } from '@/components/tier-badge';

describe('TierBadge', () => {
  it('renders "Experimental" for red tier', () => {
    render(<TierBadge tier="red" />);
    expect(screen.getByText('Experimental')).toBeInTheDocument();
  });

  it('renders "Verified" for amber tier', () => {
    render(<TierBadge tier="amber" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders "Supported" for green tier', () => {
    render(<TierBadge tier="green" />);
    expect(screen.getByText('Supported')).toBeInTheDocument();
  });

  it('applies red styling for red tier', () => {
    render(<TierBadge tier="red" />);
    const badge = screen.getByText('Experimental');
    expect(badge.className).toMatch(/red|destructive/);
  });

  it('applies amber styling for amber tier', () => {
    render(<TierBadge tier="amber" />);
    const badge = screen.getByText('Verified');
    expect(badge.className).toMatch(/amber|yellow|orange/);
  });

  it('applies green styling for green tier', () => {
    render(<TierBadge tier="green" />);
    const badge = screen.getByText('Supported');
    expect(badge.className).toMatch(/green|emerald/);
  });
});
