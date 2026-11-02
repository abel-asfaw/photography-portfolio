import { type Session, createClient } from '@supabase/supabase-js';
import { create } from 'zustand';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

interface SessionState {
  session: Session | null;
  isLoading: boolean;
}

/**
 * Mirrors the Supabase auth session for React. supabase-js persists the
 * session in localStorage and refreshes the access token on its own.
 */
export const useSession = create<SessionState>(() => ({
  session: null,
  isLoading: true,
}));

supabase.auth.onAuthStateChange((_event, session) => {
  useSession.setState({ session, isLoading: false });
});
