import * as stylex from '@stylexjs/stylex';

import { useSession } from '@/src/api/supabase';
import { colors } from '@/src/styles/tokens.stylex';

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
      return <div {...stylex.props(styles.loading)}>Loading...</div>;
    }

    if (!session) return <LoginForm />;

    return <Component {...props} />;
  };
}

const styles = stylex.create({
  loading: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textLight,
  },
});
