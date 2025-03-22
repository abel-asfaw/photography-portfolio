import { withAuthenticationRequired } from '@auth0/auth0-react';

interface AuthGuardProps {
    component: React.ComponentType;
}

export default function AuthGuard({ component }: AuthGuardProps) {
    const ProtectedComponent = withAuthenticationRequired(component);

    return <ProtectedComponent />;
}
