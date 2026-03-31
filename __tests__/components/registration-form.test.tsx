import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegistrationForm } from '@/components/registration-form';

// SimilarToolsCheck fires fetch calls; mock it to keep tests self-contained
vi.mock('@/components/similar-tools-check', () => ({
  SimilarToolsCheck: () => null,
}));

describe('RegistrationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
    // jsdom does not implement scrollIntoView
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  // ── Helpers ───────────────────────────────────────────────
  // userEvent.type does not update React controlled inputs when motion.* components
  // are mocked as Fragments. Use fireEvent.change instead for navigation helpers.

  function fillStep1() {
    fireEvent.change(screen.getByLabelText(/app name/i), { target: { value: 'Test Tool' } });
    fireEvent.change(screen.getByLabelText(/problem/i), { target: { value: 'This is a test problem statement that is long enough' } });
  }

  function goToStep2() {
    fillStep1();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
  }

  function goToStep3() {
    goToStep2();
    // Step 2: select Department target users
    fireEvent.click(screen.getByText(/department/i));
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
  }

  function goToStep4() {
    goToStep3();
    // Step 3: no required fields — click Next
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
  }

  // ── Step 1: Identity ──────────────────────────────────────
  describe('Step 1: What are you building?', () => {
    it('renders app name field on initial load', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/app name/i)).toBeInTheDocument();
    });

    it('renders problem statement field on initial load', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      expect(screen.getByLabelText(/problem/i)).toBeInTheDocument();
    });

    it('renders step 1 heading with icon context', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      expect(screen.getByText(/what are you building/i)).toBeInTheDocument();
    });

    it('shows Next button but not Back button on step 1', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    });

    it('shows validation errors when clicking Next with empty fields', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      expect(screen.getByLabelText(/app name/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  // ── Step Navigation ───────────────────────────────────────
  describe('Step navigation', () => {
    it('advances to step 2 after filling step 1 and clicking Next', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep2();
      expect(screen.getByText(/who is it for/i)).toBeInTheDocument();
    });

    it('shows Back button on step 2', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep2();
      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('goes back to step 1 when clicking Back on step 2', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep2();
      fireEvent.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByText(/what are you building/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/app name/i)).toHaveValue('Test Tool');
    });
  });

  // ── Step 2: Context ───────────────────────────────────────
  describe('Step 2: Who is it for?', () => {
    it('renders target users selection', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep2();
      expect(screen.getByText(/my team/i)).toBeInTheDocument();
      expect(screen.getByText(/department/i)).toBeInTheDocument();
      expect(screen.getByText(/organisation/i)).toBeInTheDocument();
    });

    it('renders potential ROI field', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep2();
      expect(screen.getByLabelText(/roi/i)).toBeInTheDocument();
    });

    it('requires target users to advance', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep2();
      fireEvent.click(screen.getByRole('button', { name: /next/i }));
      // Should stay on step 2
      expect(screen.getByText(/who is it for/i)).toBeInTheDocument();
    });
  });

  // ── Step 3: Data & Security ───────────────────────────────
  describe('Step 3: Data & Security', () => {
    it('renders business data question', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep3();
      expect(screen.getByText(/business data/i)).toBeInTheDocument();
    });

    it('renders PII question', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep3();
      expect(screen.getByText(/pii/i)).toBeInTheDocument();
    });

    it('renders API keys question', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep3();
      expect(screen.getByText(/api key/i)).toBeInTheDocument();
    });

    it('reveals API key services input when Yes is selected', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep3();

      expect(screen.queryByLabelText(/which services/i)).not.toBeInTheDocument();

      const apiKeysSection = screen.getByText(/api key/i).closest('fieldset') || screen.getByText(/api key/i).parentElement;
      const yesButton = Array.from(apiKeysSection?.querySelectorAll('button') || [])
        .find(el => el.textContent?.trim() === 'Yes');
      if (yesButton) fireEvent.click(yesButton);

      expect(screen.getByLabelText(/which services/i)).toBeInTheDocument();
    });
  });

  // ── Step 4: Final + Submit ────────────────────────────────
  describe('Step 4: Final details & submit', () => {
    it('renders the access URL field on step 4', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep4();
      expect(screen.getByLabelText(/where can people access/i)).toBeInTheDocument();
    });

    it('includes app_url in submitted payload when filled', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep4();

      fireEvent.change(screen.getByLabelText(/where can people access/i), {
        target: { value: 'https://my-tool.vercel.app' },
      });
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      const payload = mockOnSubmit.mock.calls[0][0];
      expect(payload.app_url).toBe('https://my-tool.vercel.app');
    });

    it('renders third-party replacement question', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep4();
      expect(screen.getByText(/third.party/i)).toBeInTheDocument();
    });

    it('reveals replaced tool fields when Yes is selected', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep4();

      expect(screen.queryByLabelText(/which tool/i)).not.toBeInTheDocument();

      const thirdPartySection = screen.getByText(/third.party/i).closest('fieldset') || screen.getByText(/third.party/i).parentElement;
      const yesButton = Array.from(thirdPartySection?.querySelectorAll('button') || [])
        .find(el => el.textContent?.trim() === 'Yes');
      if (yesButton) fireEvent.click(yesButton);

      expect(screen.getByLabelText(/which tool/i)).toBeInTheDocument();
    });

    it('shows review summary of previous answers', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep4();
      expect(screen.getByText('Test Tool')).toBeInTheDocument();
    });

    it('shows Register App button instead of Next on final step', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep4();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
    });

    it('calls onSubmit with correct payload', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      goToStep4();
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const payload = mockOnSubmit.mock.calls[0][0];
      expect(payload.name).toBe('Test Tool');
      expect(payload.layer).toBe('L3'); // default layer
      expect(payload.target_users).toBe('department');
    });

    it('disables submit button while submitting', async () => {
      const slowSubmit = vi.fn((): Promise<void> => new Promise(() => {}));
      render(<RegistrationForm onSubmit={slowSubmit} />);
      goToStep4();

      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      // Button text changes to "Registering..." and becomes disabled after React re-render
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /register/i })).toBeDisabled()
      );
    });
  });

  // ── Progress indicator ────────────────────────────────────
  describe('Progress indicator', () => {
    it('renders 4 step indicators', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      const steps = screen.getAllByTestId(/step-indicator/);
      expect(steps).toHaveLength(4);
    });

    it('marks step 1 as active on initial load', () => {
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      const step1 = screen.getByTestId('step-indicator-1');
      expect(step1.className).toMatch(/active|purple/);
    });
  });
});
