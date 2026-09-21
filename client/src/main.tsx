import '@/src/index.css';
import {
  Auth0Provider,
  type Auth0ProviderOptions,
  useAuth0,
} from '@auth0/auth0-react';
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { authToken } from '@/src/api/authToken';
import App from '@/src/App';

const providerConfig: Auth0ProviderOptions = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  },
  useRefreshTokens: true,
  cacheLocation: 'localstorage',
};

const AuthInject = () => {
  const { getAccessTokenSilently, loginWithRedirect } = useAuth0();

  useEffect(() => {
    authToken.setAuthGetter(getAccessTokenSilently);
    return () => authToken.setAuthGetter(undefined);
  }, [getAccessTokenSilently]);

  useEffect(() => {
    authToken.setLoginRedirect(() =>
      loginWithRedirect({
        appState: {
          returnTo: `${window.location.pathname}${window.location.search}`,
        },
      }),
    );
    return () => authToken.setLoginRedirect(undefined);
  }, [loginWithRedirect]);

  return null;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Auth0Provider {...providerConfig}>
        <AuthInject />
        <App />
      </Auth0Provider>
    </BrowserRouter>
  </React.StrictMode>,
);
