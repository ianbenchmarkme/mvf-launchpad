import { describe, it, expect, vi, beforeEach } from 'vitest';
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

beforeEach(() => {
  mockFetch.mockClear();
  mockRefresh.mockClear();
  mockFetch.mockResolvedValue({ ok: true });
});

describe('GovernanceFlagsList', () => {
  it('renders null when flags array is empty', () => {
    const { container } = render(<GovernanceFlagsList flags={[]} isAdmin={true} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders app name as a link to the app profile', () => {
    render(<GovernanceFlagsList flags={[makeFlag()]} isAdmin={true} />);
    const link = screen.getByRole('link', { name: 'Test App' });
    expect(link).toHaveAttribute('href', '/apps/app-1');
  });

  it('renders "Unknown app" when apps is null', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ apps: null })]} isAdmin={true} />);
    expect(screen.getByText('Unknown app')).toBeInTheDocument();
  });

  it('renders flag type label with underscores replaced by spaces', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ flag_type: 'stale_owner' })]} isAdmin={true} />);
    expect(screen.getByText('stale owner')).toBeInTheDocument();
  });

  it('shows System badge when created_by is null', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ created_by: null })]} isAdmin={true} />);
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('shows Admin badge when created_by is a UUID', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ created_by: 'user-uuid-123' })]} isAdmin={true} />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('renders description text when flag.description is non-null', () => {
    render(
      <GovernanceFlagsList
        flags={[makeFlag({ description: 'No activity for 60+ days. Owner confirmation required.' })]}
        isAdmin={true}
      />
    );
    expect(
      screen.getByText('No activity for 60+ days. Owner confirmation required.')
    ).toBeInTheDocument();
  });

  it('does not render description paragraph when flag.description is null', () => {
    render(<GovernanceFlagsList flags={[makeFlag({ description: null })]} isAdmin={true} />);
    expect(screen.queryByRole('paragraph')).toBeNull();
  });

  it('shows Resolve button when isAdmin=true', () => {
    render(<GovernanceFlagsList flags={[makeFlag()]} isAdmin={true} />);
    expect(screen.getByRole('button', { name: /resolve/i })).toBeInTheDocument();
  });

  it('does not show Resolve button when isAdmin=false', () => {
    render(<GovernanceFlagsList flags={[makeFlag()]} isAdmin={false} />);
    expect(screen.queryByRole('button', { name: /resolve/i })).toBeNull();
  });

  it('calls PATCH /api/flags/[flagId] and refreshes for non-dormancy flags', async () => {
    render(<GovernanceFlagsList flags={[makeFlag({ id: 'flag-abc', flag_type: 'stale_owner' })]} isAdmin={true} />);
    fireEvent.click(screen.getByRole('button', { name: /resolve/i }));
    await screen.findByText('Resolve');
    expect(mockFetch).toHaveBeenCalledWith('/api/flags/flag-abc', { method: 'PATCH' });
    expect(mockRefresh).toHaveBeenCalled();
  });

  it('calls POST confirm-active for dormancy_attestation flags instead of generic PATCH', async () => {
    render(
      <GovernanceFlagsList
        flags={[makeFlag({ id: 'flag-abc', app_id: 'app-xyz', flag_type: 'dormancy_attestation' })]}
        isAdmin={true}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /resolve/i }));
    await screen.findByText('Resolve');
    expect(mockFetch).toHaveBeenCalledWith('/api/apps/app-xyz/confirm-active', { method: 'POST' });
    expect(mockFetch).not.toHaveBeenCalledWith(expect.stringContaining('/api/flags/'), expect.anything());
  });

  it('shows "Resolving..." while request is in flight', async () => {
    let resolveRequest: () => void;
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => { resolveRequest = () => resolve({ ok: true }); })
    );
    render(<GovernanceFlagsList flags={[makeFlag()]} isAdmin={true} />);
    fireEvent.click(screen.getByRole('button', { name: /resolve/i }));
    expect(await screen.findByText('Resolving...')).toBeInTheDocument();
    resolveRequest!();
  });

  it('applies correct severity dot colour for critical, warning, and info', () => {
    const { rerender } = render(
      <GovernanceFlagsList flags={[makeFlag({ severity: 'critical' })]} isAdmin={true} />
    );
    expect(document.querySelector('.bg-red-500')).not.toBeNull();

    rerender(<GovernanceFlagsList flags={[makeFlag({ severity: 'warning' })]} isAdmin={true} />);
    expect(document.querySelector('.bg-amber-500')).not.toBeNull();

    rerender(<GovernanceFlagsList flags={[makeFlag({ severity: 'info' })]} isAdmin={true} />);
    // info uses bg-blue-500 on the dot (distinct from SourceBadge which uses mvf tokens)
    const dots = document.querySelectorAll('.bg-blue-500');
    expect(dots.length).toBeGreaterThan(0);
  });
});
