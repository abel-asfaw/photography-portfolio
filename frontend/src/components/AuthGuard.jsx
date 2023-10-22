import { withAuthenticationRequired } from '@auth0/auth0-react';

export default function AuthGuard({ component }) {
    const Component = withAuthenticationRequired(component);

    return <Component />;
}
