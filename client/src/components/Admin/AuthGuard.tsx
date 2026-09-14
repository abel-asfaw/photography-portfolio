import { withAuthenticationRequired } from '@auth0/auth0-react';

/**
 * Wraps a component so it only renders for an authenticated user,
 * redirecting to Auth0 login otherwise. Apply at module scope so the
 * protected component is created once, not on every render.
 */
export function withAuthGuard<P extends object>(
  component: React.ComponentType<P>,
) {
  return withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="flex grow items-center justify-center text-neutral-200">
        Loading...
      </div>
    ),
  });
}
