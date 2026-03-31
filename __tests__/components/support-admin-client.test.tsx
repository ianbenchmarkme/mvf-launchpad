import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupportAdminClient } from '@/components/support-admin-client';
import type { SupportRequestWithDetails } from '@/lib/supabase/types';

// Mock sonner toast — must use vi.hoisted so the ref is available at mock factory time
const { mockToastError } = vi.hoisted(() => ({ mockToastError: vi.fn() }));
vi.mock('sonner', () => ({
  toast: { error: mockToastError },
}));

// Mock fetch for PATCH calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

const mockRequests: SupportRequestWithDetails[] = [
  {
    id: 'req-1',
    request_type: 'bug_report',
    subject: 'Submit button broken',
    description: 'The submit button does nothing on click.',
    related_app_id: 'app-1',
    priority: 'high',
    wants_reply: true,
    status: 'open',
    resolution_note: null,
    resolved_by: null,
    resolved_at: null,
    submitted_by: 'user-1',
    submitted_email: 'user@example.com',
    submitted_name: 'Test User',
    created_at: '2026-03-31T10:00:00Z',
    updated_at: '2026-03-31T10:00:00Z',
    submitter: { full_name: 'Test User', email: 'user@example.com' },
    apps: { id: 'app-1', name: 'ArtyFish' },
  },
  {
    id: 'req-2',
    request_type: 'feature_request',
    subject: 'Add export to CSV',
    description: 'Would love to be able to export app data to CSV.',
    related_app_id: null,
    priority: 'low',
    wants_reply: false,
    status: 'in_progress',
    resolution_note: null,
    resolved_by: null,
    resolved_at: null,
    submitted_by: 'user-2',
    submitted_email: 'user2@example.com',
    submitted_name: 'Another User',
    created_at: '2026-03-30T09:00:00Z',
    updated_at: '2026-03-31T11:00:00Z',
    submitter: { full_name: 'Another User', email: 'user2@example.com' },
    apps: null,
  },
  {
    id: 'req-3',
    request_type: 'feedback',
    subject: 'Great product overall',
    description: 'Really enjoy using Launchpad. The UI is clean and intuitive.',
    related_app_id: null,
    priority: 'medium',
    wants_reply: true,
    status: 'completed',
    resolution_note: 'Thank you for the positive feedback!',
    resolved_by: 'admin-1',
    resolved_at: '2026-03-31T12:00:00Z',
    submitted_by: 'user-3',
    submitted_email: 'user3@example.com',
    submitted_name: null,
    created_at: '2026-03-29T08:00:00Z',
    updated_at: '2026-03-31T12:00:00Z',
    submitter: { full_name: null, email: 'user3@example.com' },
    apps: null,
  },
];

beforeEach(() => {
  mockFetch.mockClear();
  mockToastError.mockClear();
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ id: 'req-1', status: 'in_progress' }),
  });
});

describe('SupportAdminClient', () => {
  // ── Rendering ────────────────────────────────────────────
  describe('Initial rendering', () => {
    it('renders all requests by default', () => {
      render(<SupportAdminClient requests={mockRequests} />);
      expect(screen.getByText('Submit button broken')).toBeInTheDocument();
      expect(screen.getByText('Add export to CSV')).toBeInTheDocument();
      expect(screen.getByText('Great product overall')).toBeInTheDocument();
    });

    it('renders submitter names', () => {
      render(<SupportAdminClient requests={mockRequests} />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Another User')).toBeInTheDocument();
    });

    it('renders related app name when present', () => {
      render(<SupportAdminClient requests={mockRequests} />);
      expect(screen.getByText('ArtyFish')).toBeInTheDocument();
    });

    it('renders type badges', () => {
      render(<SupportAdminClient requests={mockRequests} />);
      // getAllByText because filter chips also contain these labels
      expect(screen.getAllByText(/bug report/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/feature request/i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/feedback/i).length).toBeGreaterThan(0);
    });

    it('shows empty state when no requests', () => {
      render(<SupportAdminClient requests={[]} />);
      expect(screen.getByText(/no support requests/i)).toBeInTheDocument();
    });
  });

  // ── Filtering ─────────────────────────────────────────────
  describe('Filtering', () => {
    it('filters by status — open only', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('filter-status-open'));
      expect(screen.getByText('Submit button broken')).toBeInTheDocument();
      expect(screen.queryByText('Add export to CSV')).not.toBeInTheDocument();
      expect(screen.queryByText('Great product overall')).not.toBeInTheDocument();
    });

    it('filters by status — in_progress only', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('filter-status-in_progress'));
      expect(screen.queryByText('Submit button broken')).not.toBeInTheDocument();
      expect(screen.getByText('Add export to CSV')).toBeInTheDocument();
    });

    it('filters by status — completed only', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('filter-status-completed'));
      expect(screen.getByText('Great product overall')).toBeInTheDocument();
      expect(screen.queryByText('Submit button broken')).not.toBeInTheDocument();
    });

    it('shows all requests when All filter selected', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('filter-status-open'));
      await user.click(screen.getByTestId('filter-status-all'));
      expect(screen.getByText('Submit button broken')).toBeInTheDocument();
      expect(screen.getByText('Add export to CSV')).toBeInTheDocument();
      expect(screen.getByText('Great product overall')).toBeInTheDocument();
    });

    it('filters by type — bug_report only', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('filter-type-bug_report'));
      expect(screen.getByText('Submit button broken')).toBeInTheDocument();
      expect(screen.queryByText('Add export to CSV')).not.toBeInTheDocument();
    });

    it('filters by priority — high only', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('filter-priority-high'));
      expect(screen.getByText('Submit button broken')).toBeInTheDocument();
      expect(screen.queryByText('Add export to CSV')).not.toBeInTheDocument();
    });
  });

  // ── Status update — in_progress (no modal) ───────────────
  describe('Status update to in_progress', () => {
    it('calls PATCH when setting status to in_progress', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('status-btn-req-1'));
      const inProgressOption = screen.getByRole('option', { name: /in progress/i });
      await user.click(inProgressOption);
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/support/req-1',
          expect.objectContaining({ method: 'PATCH' })
        );
      });
    });
  });

  // ── Resolution modal ──────────────────────────────────────
  describe('Resolution modal', () => {
    it('shows modal when setting status to completed', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('status-btn-req-1'));
      await user.click(screen.getByRole('option', { name: /^completed$/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/resolution note/i)).toBeInTheDocument();
    });

    it('shows modal when setting status to wont_do', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('status-btn-req-1'));
      await user.click(screen.getByRole('option', { name: /won.t do/i }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('shows validation error in modal when note is too short', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('status-btn-req-1'));
      await user.click(screen.getByRole('option', { name: /^completed$/i }));
      await user.type(screen.getByLabelText(/resolution note/i), 'Too short');
      await user.click(screen.getByRole('button', { name: /save/i }));
      expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
    });

    it('calls PATCH with resolution note when modal saved', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('status-btn-req-1'));
      await user.click(screen.getByRole('option', { name: /^completed$/i }));
      await user.type(screen.getByLabelText(/resolution note/i), 'This has been fixed in the latest deploy.');
      await user.click(screen.getByRole('button', { name: /save/i }));
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/support/req-1',
          expect.objectContaining({
            method: 'PATCH',
            body: expect.stringContaining('completed'),
          })
        );
      });
    });

    it('dismisses modal when Cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('status-btn-req-1'));
      await user.click(screen.getByRole('option', { name: /^completed$/i }));
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('keeps modal open and shows error toast when PATCH fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Server error' }),
      });

      const user = userEvent.setup();
      render(<SupportAdminClient requests={mockRequests} />);
      await user.click(screen.getByTestId('status-btn-req-1'));
      await user.click(screen.getByRole('option', { name: /^completed$/i }));
      await user.type(screen.getByLabelText(/resolution note/i), 'This has been fixed in the latest deploy.');
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockToastError).toHaveBeenCalledWith('Server error');
      });
      // Modal must remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
