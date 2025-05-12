import { GetTokenSilentlyOptions } from '@auth0/auth0-react';
import { GetTokenSilentlyVerboseResponse } from '@auth0/auth0-spa-js';

interface GetTokenInterface {
  (
    options: GetTokenSilentlyOptions & { detailedResponse: true },
  ): Promise<GetTokenSilentlyVerboseResponse>;
  (options?: GetTokenSilentlyOptions): Promise<string>;
  (
    options: GetTokenSilentlyOptions,
  ): Promise<GetTokenSilentlyVerboseResponse | string>;
}

interface AuthTokenInterface {
  getToken: GetTokenInterface | undefined;
  setAuthGetter(getToken: GetTokenInterface): void;
}

class AuthToken implements AuthTokenInterface {
  getToken: GetTokenInterface | undefined;
  setAuthGetter(getToken: GetTokenInterface | undefined) {
    this.getToken = getToken;
  }
}

export const authToken = new AuthToken();
