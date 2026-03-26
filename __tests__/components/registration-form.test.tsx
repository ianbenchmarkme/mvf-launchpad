import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RegistrationForm } from '@/components/registration-form';

describe('RegistrationForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders app name field', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/app name/i)).toBeInTheDocument();
  });

  it('renders problem statement field', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/problem/i)).toBeInTheDocument();
  });

  it('renders layer selection', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/product.*design/i)).toBeInTheDocument();
    expect(screen.getByText(/makers/i)).toBeInTheDocument();
  });

  it('renders target users selection', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/my team/i)).toBeInTheDocument();
    expect(screen.getByText(/department/i)).toBeInTheDocument();
    expect(screen.getByText(/organisation/i)).toBeInTheDocument();
  });

  it('renders potential ROI field', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByLabelText(/roi/i)).toBeInTheDocument();
  });

  it('renders business data question', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/business data/i)).toBeInTheDocument();
  });

  it('renders PII question', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/pii/i)).toBeInTheDocument();
  });

  it('renders API keys question', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/api key/i)).toBeInTheDocument();
  });

  it('renders third-party replacement question', () => {
    render(<RegistrationForm onSubmit={mockOnSubmit} />);
    expect(screen.getByText(/third.party/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    // Should show at least name and problem statement errors
    expect(screen.getByText(/name/i)).toBeInTheDocument();
  });

  it('reveals API key services input when "Yes" is selected for API keys', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);

    // Initially, the services input should not be visible
    expect(screen.queryByLabelText(/which services/i)).not.toBeInTheDocument();

    // Find and click the "Yes" option for API keys
    const apiKeysSection = screen.getByText(/api key/i).closest('fieldset') || screen.getByText(/api key/i).parentElement;
    const yesButtons = apiKeysSection?.querySelectorAll('button, input, label');
    const yesButton = Array.from(yesButtons || []).find(el => el.textContent?.trim() === 'Yes');
    if (yesButton) await user.click(yesButton);

    // Now the services input should be visible
    expect(screen.getByLabelText(/which services/i)).toBeInTheDocument();
  });

  it('reveals replaced tool fields when third-party replacement is toggled on', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);

    // Initially not visible
    expect(screen.queryByLabelText(/which tool/i)).not.toBeInTheDocument();

    // Toggle on
    const thirdPartySection = screen.getByText(/third.party/i).closest('fieldset') || screen.getByText(/third.party/i).parentElement;
    const yesButtons = thirdPartySection?.querySelectorAll('button, input, label');
    const yesButton = Array.from(yesButtons || []).find(el => el.textContent?.trim() === 'Yes');
    if (yesButton) await user.click(yesButton);

    expect(screen.getByLabelText(/which tool/i)).toBeInTheDocument();
  });

  it('calls onSubmit with correct payload when form is valid', async () => {
    const user = userEvent.setup();
    render(<RegistrationForm onSubmit={mockOnSubmit} />);

    // Fill required fields
    await user.type(screen.getByLabelText(/app name/i), 'Test Tool');
    await user.type(screen.getByLabelText(/problem/i), 'This is a test problem statement that is long enough');

    // Select layer
    const l2Button = screen.getByText(/product.*design/i);
    await user.click(l2Button);

    // Select target users
    const deptButton = screen.getByText(/department/i);
    await user.click(deptButton);

    // Submit
    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    const payload = mockOnSubmit.mock.calls[0][0];
    expect(payload.name).toBe('Test Tool');
    expect(payload.layer).toBe('L2');
    expect(payload.target_users).toBe('department');
  });

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup();
    // Make onSubmit return a promise that doesn't resolve immediately
    const slowSubmit = vi.fn((): Promise<void> => new Promise(() => {}));
    render(<RegistrationForm onSubmit={slowSubmit} />);

    await user.type(screen.getByLabelText(/app name/i), 'Test Tool');
    await user.type(screen.getByLabelText(/problem/i), 'This is a test problem statement that is long enough');
    await user.click(screen.getByText(/product.*design/i));
    await user.click(screen.getByText(/department/i));

    const submitButton = screen.getByRole('button', { name: /register/i });
    await user.click(submitButton);

    expect(submitButton).toBeDisabled();
  });
});
