import '@/src/index.css';

import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';

import App from '@/src/App';
import { authToken } from './api/apiClient';

const providerConfig = {
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  authorizationParams: {
    redirect_uri: import.meta.env.VITE_AUTH0_REDIRECT_URI,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  },
};

const AuthInject = () => {
  const { getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    authToken.setAuthGetter(getAccessTokenSilently);
    return () => authToken.setAuthGetter(undefined);
  }, [getAccessTokenSilently]);

  return null;
};
<AuthInject />;

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
