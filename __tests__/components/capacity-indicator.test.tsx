import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CapacityIndicator } from '@/components/capacity-indicator';

describe('CapacityIndicator', () => {
  it('displays capacity used out of limit', () => {
    render(<CapacityIndicator used={2.5} limit={5} />);
    expect(screen.getByText('2.5')).toBeInTheDocument();
    expect(screen.getByText(/5 points/)).toBeInTheDocument();
  });

  it('displays zero capacity when no apps owned', () => {
    render(<CapacityIndicator used={0} limit={5} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('renders a progress bar', () => {
    render(<CapacityIndicator used={3} limit={5} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
  });

  it('sets progress bar value correctly', () => {
    render(<CapacityIndicator used={2.5} limit={5} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.getAttribute('aria-valuenow')).toBe('50');
  });

  it('shows warning state when near capacity (80%+)', () => {
    const { container } = render(<CapacityIndicator used={4.5} limit={5} />);
    expect(container.innerHTML).toMatch(/warning|amber|yellow|orange/);
  });

  it('shows full state when at capacity', () => {
    const { container } = render(<CapacityIndicator used={5} limit={5} />);
    expect(container.innerHTML).toMatch(/full|red|destructive/);
  });
});
