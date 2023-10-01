import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Admin from './components/Admin';
import AuthenticationGuard from './components/AuthenticationGuard';
import PhotoList from './components/PhotoList';
import usePhotosContext from './hooks/usePhotosContext';

export default function App() {
    const { fetchPhotosAndSync } = usePhotosContext();

    useEffect(() => {
        fetchPhotosAndSync();
    }, [fetchPhotosAndSync]);

    return (
        <Routes>
            <Route path="/" element={<PhotoList />} />
            <Route
                path="/admin"
                element={<AuthenticationGuard component={Admin} />}
            />
        </Routes>
    );
}
