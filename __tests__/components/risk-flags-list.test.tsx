import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskFlagsList } from '@/components/risk-flags-list';
import type { RiskFlag } from '@/lib/supabase/types';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock fetch globally
const mockFetch = vi.fn().mockResolvedValue({ ok: true });
vi.stubGlobal('fetch', mockFetch);

const makeFlag = (overrides: Partial<RiskFlag> = {}): RiskFlag => ({
  id: 'flag-1',
  app_id: 'app-1',
  flag_type: 'stale_owner',
  severity: 'warning',
  description: null,
  created_by: null,
  created_at: '2026-01-01T00:00:00Z',
  resolved_at: null,
  resolved_by: null,
  ...overrides,
});

describe('RiskFlagsList', () => {
  it('renders null when flags array is empty', () => {
    const { container } = render(
      <RiskFlagsList flags={[]} isAdmin={false} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders flag type label with underscores replaced by spaces', () => {
    render(<RiskFlagsList flags={[makeFlag({ flag_type: 'stale_owner' })]} isAdmin={false} />);
    expect(screen.getByText('stale owner')).toBeInTheDocument();
  });

  it('renders description when present', () => {
    render(
      <RiskFlagsList
        flags={[makeFlag({ description: 'Test description' })]}
        isAdmin={false}
      />
    );
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('shows Resolve button for admin', () => {
    render(<RiskFlagsList flags={[makeFlag()]} isAdmin={true} />);
    expect(screen.getByText('Resolve')).toBeInTheDocument();
  });

  it('does not show Resolve button for non-admin', () => {
    render(<RiskFlagsList flags={[makeFlag()]} isAdmin={false} />);
    expect(screen.queryByText('Resolve')).toBeNull();
  });

  it('does not show "Confirm active" for non-dormancy flags even when isOwner=true', () => {
    render(
      <RiskFlagsList
        flags={[makeFlag({ flag_type: 'stale_owner' })]}
        isAdmin={false}
        isOwner={true}
        appId="app-1"
      />
    );
    expect(screen.queryByText('Confirm active')).toBeNull();
  });

  it('shows "Confirm active" button for dormancy_attestation flag when isOwner=true', () => {
    render(
      <RiskFlagsList
        flags={[makeFlag({ flag_type: 'dormancy_attestation' })]}
        isAdmin={false}
        isOwner={true}
        appId="app-1"
      />
    );
    expect(screen.getByText('Confirm active')).toBeInTheDocument();
  });

  it('does not show "Confirm active" for dormancy_attestation flag when isOwner=false', () => {
    render(
      <RiskFlagsList
        flags={[makeFlag({ flag_type: 'dormancy_attestation' })]}
        isAdmin={false}
        isOwner={false}
        appId="app-1"
      />
    );
    expect(screen.queryByText('Confirm active')).toBeNull();
  });

  it('shows "Confirming..." while confirm-active request is in flight', async () => {
    let resolveConfirm: () => void;
    mockFetch.mockImplementationOnce(
      () => new Promise((resolve) => { resolveConfirm = () => resolve({ ok: true }); })
    );

    render(
      <RiskFlagsList
        flags={[makeFlag({ flag_type: 'dormancy_attestation' })]}
        isAdmin={false}
        isOwner={true}
        appId="app-1"
      />
    );

    fireEvent.click(screen.getByText('Confirm active'));
    expect(await screen.findByText('Confirming...')).toBeInTheDocument();

    resolveConfirm!();
  });

  it('admin Resolve button shows for any flag type', () => {
    render(
      <RiskFlagsList
        flags={[makeFlag({ flag_type: 'dormancy_attestation' })]}
        isAdmin={true}
        isOwner={false}
      />
    );
    expect(screen.getByText('Resolve')).toBeInTheDocument();
  });

  it('calls POST /api/apps/[appId]/confirm-active when Confirm active is clicked', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });
    render(
      <RiskFlagsList
        flags={[makeFlag({ flag_type: 'dormancy_attestation' })]}
        isAdmin={false}
        isOwner={true}
        appId="app-1"
      />
    );
    fireEvent.click(screen.getByText('Confirm active'));
    expect(mockFetch).toHaveBeenCalledWith('/api/apps/app-1/confirm-active', { method: 'POST' });
  });
});
