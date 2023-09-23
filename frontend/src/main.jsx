import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { PhotosProvider } from './context/photosContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
            <PhotosProvider>
            <App />
            </PhotosProvider>
    </React.StrictMode>,
);
