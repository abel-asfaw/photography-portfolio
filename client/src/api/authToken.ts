import type { Auth0ContextInterface } from '@auth0/auth0-react';

type GetToken = Auth0ContextInterface['getAccessTokenSilently'];
type LoginRedirect = () => Promise<void>;

interface AuthTokenInterface {
  getToken: GetToken | undefined;
  redirectToLogin: LoginRedirect | undefined;
  setAuthGetter(getToken: GetToken | undefined): void;
  setLoginRedirect(redirectToLogin: LoginRedirect | undefined): void;
}

class AuthToken implements AuthTokenInterface {
  getToken: GetToken | undefined;
  redirectToLogin: LoginRedirect | undefined;
  setAuthGetter(getToken: GetToken | undefined) {
    this.getToken = getToken;
  }
  setLoginRedirect(redirectToLogin: LoginRedirect | undefined) {
    this.redirectToLogin = redirectToLogin;
  }
}

export const authToken = new AuthToken();
