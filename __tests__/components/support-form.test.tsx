import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SupportForm } from '@/components/support-form';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode }) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useReducedMotion: () => false,
}));

const mockUserApps = [
  { id: 'app-1', name: 'ArtyFish' },
  { id: 'app-2', name: 'Allegros' },
];

describe('SupportForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  // ── Step 1 rendering ─────────────────────────────────────
  describe('Step 1: What is the issue?', () => {
    it('renders step 1 heading on initial load', () => {
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      expect(screen.getByText(/what.s the issue/i)).toBeInTheDocument();
    });

    it('renders request type buttons', () => {
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: /bug report/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /feature request/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /feedback/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /question/i })).toBeInTheDocument();
    });

    it('renders subject field', () => {
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    });

    it('renders description field', () => {
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('shows Next but not Back on step 1', () => {
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.queryByTestId('back-button')).not.toBeInTheDocument();
    });
  });

  // ── Step 1 validation ────────────────────────────────────
  describe('Step 1 validation', () => {
    it('shows error when subject is too short', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await user.click(screen.getByRole('button', { name: /bug report/i }));
      await user.type(screen.getByLabelText(/subject/i), 'Hi');
      await user.type(screen.getByLabelText(/description/i), 'This is a long enough description for the form.');
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument();
    });

    it('shows error when description is too short', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await user.click(screen.getByRole('button', { name: /bug report/i }));
      await user.type(screen.getByLabelText(/subject/i), 'Valid subject');
      await user.type(screen.getByLabelText(/description/i), 'Too short');
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/at least 20 characters/i)).toBeInTheDocument();
    });

    it('shows error when request type not selected', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await user.type(screen.getByLabelText(/subject/i), 'Valid subject');
      await user.type(screen.getByLabelText(/description/i), 'This is a long enough description for the form.');
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/select a request type/i)).toBeInTheDocument();
    });

    it('stays on step 1 when validation fails', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/what.s the issue/i)).toBeInTheDocument();
    });
  });

  // ── Step navigation ───────────────────────────────────────
  describe('Step navigation', () => {
    async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: /bug report/i }));
      await user.type(screen.getByLabelText(/subject/i), 'Button not working correctly');
      await user.type(screen.getByLabelText(/description/i), 'The submit button on the registration form does nothing when clicked.');
    }

    it('advances to step 2 after valid step 1', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await fillStep1(user);
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByText(/a bit more detail/i)).toBeInTheDocument();
    });

    it('shows Back button on step 2', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await fillStep1(user);
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByTestId('back-button')).toBeInTheDocument();
    });

    it('returns to step 1 when clicking Back on step 2', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await fillStep1(user);
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByTestId('back-button'));
      expect(screen.getByText(/what.s the issue/i)).toBeInTheDocument();
    });
  });

  // ── Step 2 rendering ─────────────────────────────────────
  describe('Step 2: A bit more detail', () => {
    async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
      await user.click(screen.getByRole('button', { name: /bug report/i }));
      await user.type(screen.getByLabelText(/subject/i), 'Button not working correctly');
      await user.type(screen.getByLabelText(/description/i), 'The submit button on the registration form does nothing when clicked.');
      await user.click(screen.getByRole('button', { name: /next/i }));
    }

    it('renders related app dropdown', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await goToStep2(user);
      expect(screen.getByLabelText(/related app/i)).toBeInTheDocument();
    });

    it('renders priority buttons', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await goToStep2(user);
      expect(screen.getByRole('button', { name: /low/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /medium/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /high/i })).toBeInTheDocument();
    });

    it('renders contact me back buttons', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await goToStep2(user);
      expect(screen.getByRole('button', { name: /^yes$/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^no$/i })).toBeInTheDocument();
    });

    it('shows user apps in dropdown', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await goToStep2(user);
      expect(screen.getByText('ArtyFish')).toBeInTheDocument();
      expect(screen.getByText('Allegros')).toBeInTheDocument();
    });

    it('shows Submit button on step 2', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await goToStep2(user);
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });
  });

  // ── Submission ────────────────────────────────────────────
  describe('Submission', () => {
    async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
      // Step 1
      await user.click(screen.getByRole('button', { name: /feature request/i }));
      await user.type(screen.getByLabelText(/subject/i), 'Add dark mode toggle');
      await user.type(screen.getByLabelText(/description/i), 'It would be great to have a dark mode toggle in the settings page for better usability.');
      await user.click(screen.getByRole('button', { name: /next/i }));
      // Step 2 — defaults are fine (medium priority, yes to contact)
      await user.click(screen.getByRole('button', { name: /submit/i }));
    }

    it('calls onSubmit with correct data', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await fillAndSubmit(user);
      expect(mockOnSubmit).toHaveBeenCalledOnce();
      const submitted = mockOnSubmit.mock.calls[0][0];
      expect(submitted.request_type).toBe('feature_request');
      expect(submitted.subject).toBe('Add dark mode toggle');
      expect(submitted.priority).toBe('medium');
      expect(submitted.wants_reply).toBe(true);
    });

    it('does not call onSubmit if step 1 is invalid', async () => {
      const user = userEvent.setup();
      render(<SupportForm userApps={mockUserApps} onSubmit={mockOnSubmit} />);
      await user.click(screen.getByRole('button', { name: /next/i }));
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});
