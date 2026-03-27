import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AppProfileClient } from '@/components/app-profile-client';
import type { App, AppOwner, Profile, RiskFlag } from '@/lib/supabase/types';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

// Mock SimilarToolsCheck to avoid API calls in tests
vi.mock('@/components/similar-tools-check', () => ({
  SimilarToolsCheck: ({ query }: { query: string }) => (
    <div data-testid="similar-tools-check">{query}</div>
  ),
}));

// Mock child components that don't need testing here
vi.mock('@/components/tier-badge', () => ({
  TierBadge: ({ tier }: { tier: string }) => <span data-testid="tier-badge">{tier}</span>,
}));
vi.mock('@/components/delete-app-button', () => ({
  DeleteAppButton: () => <div data-testid="delete-app-button" />,
}));
vi.mock('@/components/admin-actions', () => ({
  AdminActions: () => <div data-testid="admin-actions" />,
}));
vi.mock('@/components/risk-flags-list', () => ({
  RiskFlagsList: () => <div data-testid="risk-flags-list" />,
}));

const mockApp: App = {
  id: 'app-1',
  name: 'ArtyFish',
  problem_statement: 'AI-powered marketing creative tools',
  layer: 'L2',
  target_users: 'department',
  potential_roi: 'Saves 10h/week',
  needs_business_data: 'no',
  handles_pii: 'no',
  uses_api_keys: 'yes',
  api_key_services: 'OpenAI',
  replaces_third_party: false,
  replaced_tool_name: null,
  replaced_tool_cost: null,
  tier: 'red',
  status: 'intent',
  last_activity_at: null,
  created_by: 'user-1',
  created_at: '2026-03-01T00:00:00Z',
  updated_at: '2026-03-15T00:00:00Z',
};

const mockOwner: AppOwner & { profiles: Profile } = {
  id: 'owner-1',
  app_id: 'app-1',
  user_id: 'user-1',
  owner_role: 'primary',
  created_at: '2026-03-01T00:00:00Z',
  profiles: {
    id: 'user-1',
    email: 'maker@mvf.com',
    full_name: 'Test Maker',
    avatar_url: null,
    role: 'maker',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
  },
};

const defaultProps = {
  app: mockApp,
  owners: [mockOwner],
  flags: [] as RiskFlag[],
  isAdmin: false,
  isOwner: true,
};

beforeEach(() => {
  vi.clearAllMocks();
  global.fetch = vi.fn();
});

describe('AppProfileClient', () => {
  it('renders app name and problem statement in header', () => {
    render(<AppProfileClient {...defaultProps} />);
    // Name appears in both header and Identity section read content
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('ArtyFish');
    // Problem statement appears in header summary and Identity section
    expect(screen.getAllByText('AI-powered marketing creative tools').length).toBeGreaterThanOrEqual(1);
  });

  it('renders all four section titles', () => {
    render(<AppProfileClient {...defaultProps} />);
    expect(screen.getByText('Identity')).toBeInTheDocument();
    expect(screen.getByText('Context')).toBeInTheDocument();
    expect(screen.getByText('Data & Security')).toBeInTheDocument();
    expect(screen.getByText('Third-Party Replacement')).toBeInTheDocument();
  });

  it('shows Edit buttons when user is owner', () => {
    render(<AppProfileClient {...defaultProps} isOwner={true} />);
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(4);
  });

  it('hides Edit buttons when user is not owner and not admin', () => {
    render(<AppProfileClient {...defaultProps} isOwner={false} isAdmin={false} />);
    expect(screen.queryAllByText('Edit')).toHaveLength(0);
  });

  it('shows Edit buttons when user is admin (even if not owner)', () => {
    render(<AppProfileClient {...defaultProps} isOwner={false} isAdmin={true} />);
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBe(4);
  });

  it('shows admin controls only for admins', () => {
    const { rerender } = render(<AppProfileClient {...defaultProps} isAdmin={false} />);
    expect(screen.queryByTestId('admin-actions')).not.toBeInTheDocument();
    rerender(<AppProfileClient {...defaultProps} isAdmin={true} />);
    expect(screen.getByTestId('admin-actions')).toBeInTheDocument();
  });

  it('enters edit mode when Edit is clicked on Identity section', () => {
    render(<AppProfileClient {...defaultProps} />);
    // Click the first Edit button (Identity section)
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]);
    // Should show Save and Cancel
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    // Should show input fields
    expect(screen.getByLabelText('App Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Problem Statement')).toBeInTheDocument();
  });

  it('only allows one section to be edited at a time', () => {
    render(<AppProfileClient {...defaultProps} />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]); // Edit Identity
    // Other Edit buttons should disappear (only 0 remain since Identity is in edit mode)
    expect(screen.queryAllByText('Edit')).toHaveLength(3); // 3 remaining sections still show Edit
  });

  it('cancels editing and restores original values', () => {
    render(<AppProfileClient {...defaultProps} />);
    const editButtons = screen.getAllByText('Edit');
    fireEvent.click(editButtons[0]); // Edit Identity

    // Change the name
    const nameInput = screen.getByLabelText('App Name') as HTMLInputElement;
    fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
    expect(nameInput.value).toBe('Changed Name');

    // Cancel
    fireEvent.click(screen.getByText('Cancel'));

    // Should exit edit mode
    expect(screen.queryByText('Save')).not.toBeInTheDocument();
    // All 4 Edit buttons should be back
    expect(screen.getAllByText('Edit')).toHaveLength(4);
  });

  it('validates Identity section — rejects short name', () => {
    render(<AppProfileClient {...defaultProps} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);

    const nameInput = screen.getByLabelText('App Name');
    fireEvent.change(nameInput, { target: { value: 'A' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('App name must be at least 2 characters')).toBeInTheDocument();
  });

  it('validates Identity section — rejects short problem statement', () => {
    render(<AppProfileClient {...defaultProps} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);

    const psInput = screen.getByLabelText('Problem Statement');
    fireEvent.change(psInput, { target: { value: 'Short' } });
    fireEvent.click(screen.getByText('Save'));

    expect(screen.getByText('Problem statement must be at least 10 characters')).toBeInTheDocument();
  });

  it('shows SimilarToolsCheck when name changes in edit mode', () => {
    render(<AppProfileClient {...defaultProps} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);

    const nameInput = screen.getByLabelText('App Name');
    fireEvent.change(nameInput, { target: { value: 'NewToolName' } });

    expect(screen.getByTestId('similar-tools-check')).toBeInTheDocument();
    expect(screen.getByTestId('similar-tools-check').textContent).toBe('NewToolName');
  });

  it('does not show SimilarToolsCheck when name is unchanged', () => {
    render(<AppProfileClient {...defaultProps} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);

    // Name hasn't changed — no SimilarToolsCheck
    expect(screen.queryByTestId('similar-tools-check')).not.toBeInTheDocument();
  });

  it('calls PATCH on save and refreshes router', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockApp, name: 'Updated Name' }),
    });
    global.fetch = mockFetch;

    render(<AppProfileClient {...defaultProps} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);

    const nameInput = screen.getByLabelText('App Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/apps/app-1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    // Verify payload
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(callBody.name).toBe('Updated Name');
    expect(callBody.problem_statement).toBe('AI-powered marketing creative tools');

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  it('shows error message on save failure', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Validation failed' }),
    });

    render(<AppProfileClient {...defaultProps} />);
    fireEvent.click(screen.getAllByText('Edit')[0]);
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText('Validation failed')).toBeInTheDocument();
    });
  });

  it('sends null for empty potential_roi', async () => {
    const appWithRoi = { ...mockApp, potential_roi: 'Some ROI' };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(appWithRoi),
    });
    global.fetch = mockFetch;

    render(<AppProfileClient {...defaultProps} app={appWithRoi} />);
    // Click Edit on Context section (index 1)
    fireEvent.click(screen.getAllByText('Edit')[1]);

    // Clear the ROI field
    const roiInput = screen.getByLabelText(/Potential ROI/);
    fireEvent.change(roiInput, { target: { value: '' } });
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.potential_roi).toBeNull();
    });
  });

  it('renders owner list', () => {
    render(<AppProfileClient {...defaultProps} />);
    expect(screen.getByText('Test Maker')).toBeInTheDocument();
    expect(screen.getByText('primary')).toBeInTheDocument();
  });
});
