import type { Session } from '@supabase/supabase-js';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useSession } from '@/src/api/supabase';

import { withAuthGuard } from './AuthGuard';

const { signInWithPassword } = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
}));

vi.mock('@/src/api/supabase', async () => {
  const { create } = await import('zustand');
  return {
    supabase: { auth: { signInWithPassword } },
    useSession: create(() => ({ session: null, isLoading: true })),
  };
});

const Protected = withAuthGuard(() => <p>Secret admin page</p>);

describe('withAuthGuard', () => {
  beforeEach(() => {
    signInWithPassword.mockReset();
    useSession.setState({ session: null, isLoading: true });
  });

  it('shows a loading state until the session is known', () => {
    render(<Protected />, { wrapper: MemoryRouter });
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows the login form when signed out', () => {
    useSession.setState({ isLoading: false });
    render(<Protected />, { wrapper: MemoryRouter });
    expect(screen.queryByText('Secret admin page')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Abel Asfaw' })).toBeVisible();
  });

  it('renders the wrapped component when signed in', () => {
    const session: Session = {
      access_token: 'token',
      refresh_token: 'refresh',
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: 'admin',
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: '2026-01-01T00:00:00Z',
      },
    };
    useSession.setState({ session, isLoading: false });
    render(<Protected />, { wrapper: MemoryRouter });
    expect(screen.getByText('Secret admin page')).toBeInTheDocument();
  });

  it('signs in with email and password and shows errors', async () => {
    signInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    });
    useSession.setState({ isLoading: false });
    render(<Protected />, { wrapper: MemoryRouter });

    await userEvent.type(screen.getByLabelText('Email'), 'me@example.com');
    await userEvent.type(screen.getByLabelText('Password'), 'hunter2');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'me@example.com',
      password: 'hunter2',
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Invalid login credentials',
    );
  });
});
