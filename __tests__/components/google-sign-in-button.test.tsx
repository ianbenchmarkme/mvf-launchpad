import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GoogleSignInButton } from '@/components/google-sign-in-button';

const mockSignInWithOAuth = vi.fn().mockResolvedValue({ data: {}, error: null });

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOAuth: mockSignInWithOAuth,
    },
  }),
}));

describe('GoogleSignInButton', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockClear();
  });

  it('renders a sign-in button', () => {
    render(<GoogleSignInButton />);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  it('calls signInWithOAuth with google provider when clicked', async () => {
    const user = userEvent.setup();
    render(<GoogleSignInButton />);

    const button = screen.getByRole('button', { name: /sign in with google/i });
    await user.click(button);

    expect(mockSignInWithOAuth).toHaveBeenCalledTimes(1);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google' })
    );
  });
});
