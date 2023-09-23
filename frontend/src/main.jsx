import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PhotosProvider } from './context/photosContext';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';

const providerConfig = {
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
    authorizationParams: {
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    },
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Auth0Provider {...providerConfig}>
            <PhotosProvider>
                <App />
            </PhotosProvider>
        </Auth0Provider>
    </React.StrictMode>,
);
