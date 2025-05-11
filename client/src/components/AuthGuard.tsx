import { withAuthenticationRequired } from '@auth0/auth0-react';

interface AuthGuardProps {
  component: React.ComponentType;
}

export function AuthGuard({ component }: AuthGuardProps) {
  const ProtectedComponent = withAuthenticationRequired(component, {
    onRedirecting: () => (
      <div className="flex flex-grow items-center justify-center text-neutral-200 ">
        Loading...
      </div>
    ),
  });

  return <ProtectedComponent />;
}
