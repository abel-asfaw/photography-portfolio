import { useSession } from '@/src/api/supabase';

import { LoginForm } from './LoginForm';

/**
 * Wraps a component so it only renders for a signed-in user, showing the
 * login form otherwise. Apply at module scope so the protected component
 * is created once, not on every render.
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
) {
  return function AuthGuard(props: P) {
    const session = useSession(state => state.session);
    const isLoading = useSession(state => state.isLoading);

    if (isLoading) {
      return (
        <div className="flex grow items-center justify-center text-neutral-200">
          Loading...
        </div>
      );
    }

    if (!session) return <LoginForm />;

    return <Component {...props} />;
  };
}
