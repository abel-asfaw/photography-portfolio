import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Admin from './components/Admin';
import AuthGuard from './components/AuthGuard';
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
                element={<AuthGuard component={Admin} />}
            />
        </Routes>
    );
}
