import { withAuthenticationRequired } from '@auth0/auth0-react';

interface AuthGuardProps {
    component: React.ComponentType;
}

export default function AuthGuard({ component }: AuthGuardProps) {
    const Component = withAuthenticationRequired(component);

    return <Component />;
}
