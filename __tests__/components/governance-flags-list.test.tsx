import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GovernanceFlagsList } from '@/components/governance-flags-list';
import type { RiskFlag } from '@/lib/supabase/types';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', mockFetch);

type GovernanceFlag = RiskFlag & { apps: { name: string } | null };

const makeFlag = (overrides: Partial<GovernanceFlag> = {}): GovernanceFlag => ({
  id: 'flag-1',
  app_id: 'app-1',
  flag_type: 'stale_owner',
  severity: 'warning',
  description: null,
  created_by: null,
  created_at: '2026-01-01T00:00:00Z',
  resolved_at: null,
  resolved_by: null,
  apps: { name: 'Test App' },
  ...overrides,
});

describe('GovernanceFlagsList', () => {
  it('renders null when flags array is empty', () => {
    const { container } = render(<GovernanceFlagsList flags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders app name as a link to the app profile', () => {
    render(<GovernanceFlagsList flags={[makeFlag()]} />);
    const link = screen.getByRole('link', { name: 'Test App' });
    expect(link).toHaveAttribute('href', '/apps/app-1');
  });

  it('renders "Unknown app" when apps is null', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ apps: null })]} />);
    expect(screen.getByText('Unknown app')).toBeInTheDocument();
  });

  it('renders flag type label with underscores replaced by spaces', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ flag_type: 'stale_owner' })]} />);
    expect(screen.getByText('stale owner')).toBeInTheDocument();
  });

  it('shows System badge when created_by is null', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ created_by: null })]} />);
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('shows Admin badge when created_by is a UUID', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ created_by: 'user-uuid-123' })]} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders description text when flag.description is non-null', () => {
    render(
      <GovernanceFlagsList
        flags={[makeFlag({ description: 'No activity for 60+ days. Owner confirmation required.' })]}
      />
    );
    expect(
      screen.getByText('No activity for 60+ days. Owner confirmation required.')
    ).toBeInTheDocument();
  });

  it('does not render description paragraph when flag.description is null', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ description: null })]} />);
    // No <p> with description content — check there is no second text node beyond the type label
    expect(screen.queryByRole('paragraph')).toBeNull();
  });

  it('renders the Resolve button', () => {
    render(<GovernanceFlagsList flags={[makeFlag()]} />);
    expect(screen.getByRole('button', { name: /resolve/i })).toBeInTheDocument();
  });

  it('calls PATCH /api/flags/[flagId] and refreshes on Resolve click', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(<GovernanceFlagsList flags={[makeFlag({ id: 'flag-abc' })]} />);
    fireEvent.click(screen.getByRole('button', { name: /resolve/i }));
    await screen.findByText('Resolve'); // wait for async to complete
    expect(mockFetch).toHaveBeenCalledWith('/api/flags/flag-abc', { method: 'PATCH' });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('shows "Resolving..." while request is in flight', async () => {
    let resolveRequest: () => void;
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => { resolveRequest = () => resolve({ ok: true }); })
    );
    render(<GovernanceFlagsList flags={[makeFlag()]} />);
    fireEvent.click(screen.getByRole('button', { name: /resolve/i }));
    expect(await screen.findByText('Resolving...')).toBeInTheDocument();
    resolveRequest!();
  });

  it('applies correct severity dot colour for critical, warning, and info', () => {
    const { rerender } = render(
      <GovernanceFlagsList flags={[makeFlag({ severity: 'critical' })]} />
    );
    expect(document.querySelector('.bg-red-500')).not.toBeNull();

    rerender(<GovernanceFlagsList flags={[makeFlag({ severity: 'warning' })]} />);
    expect(document.querySelector('.bg-amber-500')).not.toBeNull();

    rerender(<GovernanceFlagsList flags={[makeFlag({ severity: 'info' })]} />);
    expect(document.querySelector('.bg-blue-500')).not.toBeNull();
  });
});
