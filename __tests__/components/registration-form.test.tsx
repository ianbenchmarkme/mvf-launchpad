import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from '@/components/registration-form';

describe('RegistrationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

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

    it('shows validation errors when clicking Next with empty fields', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should stay on step 1 and show errors
      expect(screen.getByLabelText(/app name/i)).toBeInTheDocument();
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  // ── Step Navigation ───────────────────────────────────────
  describe('Step navigation', () => {
    async function fillStep1(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByLabelText(/app name/i), 'Test Tool');
      await user.type(screen.getByLabelText(/problem/i), 'This is a test problem statement that is long enough');
    }

    it('advances to step 2 after filling step 1 and clicking Next', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);

      await fillStep1(user);
      await user.click(screen.getByRole('button', { name: /next/i }));

      // Step 2 content should appear
      expect(screen.getByText(/who is it for/i)).toBeInTheDocument();
    });

    it('shows Back button on step 2', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);

      await fillStep1(user);
      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('goes back to step 1 when clicking Back on step 2', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);

      await fillStep1(user);
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByRole('button', { name: /back/i }));

      expect(screen.getByText(/what are you building/i)).toBeInTheDocument();
      // Values should be preserved
      expect(screen.getByLabelText(/app name/i)).toHaveValue('Test Tool');
    });
  });

  // ── Step 2: Context ───────────────────────────────────────
  describe('Step 2: Who is it for?', () => {
    async function goToStep2(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByLabelText(/app name/i), 'Test Tool');
      await user.type(screen.getByLabelText(/problem/i), 'This is a test problem statement that is long enough');
      await user.click(screen.getByRole('button', { name: /next/i }));
    }

    it('renders target users selection', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep2(user);

      expect(screen.getByText(/my team/i)).toBeInTheDocument();
      expect(screen.getByText(/department/i)).toBeInTheDocument();
      expect(screen.getByText(/organisation/i)).toBeInTheDocument();
    });

    it('renders potential ROI field', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep2(user);

      expect(screen.getByLabelText(/roi/i)).toBeInTheDocument();
    });

    it('requires target users to advance', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep2(user);

      await user.click(screen.getByRole('button', { name: /next/i }));

      // Should stay on step 2
      expect(screen.getByText(/who is it for/i)).toBeInTheDocument();
    });
  });

  // ── Step 3: Data & Security ───────────────────────────────
  describe('Step 3: Data & Security', () => {
    async function goToStep3(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByLabelText(/app name/i), 'Test Tool');
      await user.type(screen.getByLabelText(/problem/i), 'This is a test problem statement that is long enough');
      await user.click(screen.getByRole('button', { name: /next/i }));
      // Step 2: select target users only (no layer)
      await user.click(screen.getByText(/department/i));
      await user.click(screen.getByRole('button', { name: /next/i }));
    }

    it('renders business data question', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep3(user);

      expect(screen.getByText(/business data/i)).toBeInTheDocument();
    });

    it('renders PII question', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep3(user);

      expect(screen.getByText(/pii/i)).toBeInTheDocument();
    });

    it('renders API keys question', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep3(user);

      expect(screen.getByText(/api key/i)).toBeInTheDocument();
    });

    it('reveals API key services input when Yes is selected', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep3(user);

      expect(screen.queryByLabelText(/which services/i)).not.toBeInTheDocument();

      const apiKeysSection = screen.getByText(/api key/i).closest('fieldset') || screen.getByText(/api key/i).parentElement;
      const yesButtons = apiKeysSection?.querySelectorAll('button');
      const yesButton = Array.from(yesButtons || []).find(el => el.textContent?.trim() === 'Yes');
      if (yesButton) await user.click(yesButton);

      expect(screen.getByLabelText(/which services/i)).toBeInTheDocument();
    });
  });

  // ── Step 4: Final + Submit ────────────────────────────────
  describe('Step 4: Final details & submit', () => {
    async function goToStep4(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByLabelText(/app name/i), 'Test Tool');
      await user.type(screen.getByLabelText(/problem/i), 'This is a test problem statement that is long enough');
      await user.click(screen.getByRole('button', { name: /next/i }));
      // Step 2: select target users only (no layer)
      await user.click(screen.getByText(/department/i));
      await user.click(screen.getByRole('button', { name: /next/i }));
      await user.click(screen.getByRole('button', { name: /next/i }));
    }

    it('renders the access URL field on step 4', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep4(user);

      expect(screen.getByLabelText(/where can people access/i)).toBeInTheDocument();
    });

    it('includes app_url in submitted payload when filled', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep4(user);

      await user.type(screen.getByLabelText(/where can people access/i), 'https://my-tool.vercel.app');
      await user.click(screen.getByRole('button', { name: /register/i }));

      const payload = mockOnSubmit.mock.calls[0][0];
      expect(payload.app_url).toBe('https://my-tool.vercel.app');
    });

    it('renders third-party replacement question', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep4(user);

      expect(screen.getByText(/third.party/i)).toBeInTheDocument();
    });

    it('reveals replaced tool fields when Yes is selected', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep4(user);

      expect(screen.queryByLabelText(/which tool/i)).not.toBeInTheDocument();

      const thirdPartySection = screen.getByText(/third.party/i).closest('fieldset') || screen.getByText(/third.party/i).parentElement;
      const yesButtons = thirdPartySection?.querySelectorAll('button');
      const yesButton = Array.from(yesButtons || []).find(el => el.textContent?.trim() === 'Yes');
      if (yesButton) await user.click(yesButton);

      expect(screen.getByLabelText(/which tool/i)).toBeInTheDocument();
    });

    it('shows review summary of previous answers', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep4(user);

      // Summary should show previously entered values
      expect(screen.getByText('Test Tool')).toBeInTheDocument();
    });

    it('shows Register App button instead of Next on final step', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep4(user);

      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /^next$/i })).not.toBeInTheDocument();
    });

    it('calls onSubmit with correct payload', async () => {
      const user = userEvent.setup();
      render(<RegistrationForm onSubmit={mockOnSubmit} />);
      await goToStep4(user);

      await user.click(screen.getByRole('button', { name: /register/i }));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      const payload = mockOnSubmit.mock.calls[0][0];
      expect(payload.name).toBe('Test Tool');
      expect(payload.layer).toBe('L3'); // default layer
      expect(payload.target_users).toBe('department');
    });

    it('disables submit button while submitting', async () => {
      const user = userEvent.setup();
      const slowSubmit = vi.fn((): Promise<void> => new Promise(() => {}));
      render(<RegistrationForm onSubmit={slowSubmit} />);
      await goToStep4(user);

      const submitButton = screen.getByRole('button', { name: /register/i });
      await user.click(submitButton);

      expect(submitButton).toBeDisabled();
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
