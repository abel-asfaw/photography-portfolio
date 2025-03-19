import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';

import Admin from '@/src/components/Admin';
import AuthGuard from '@/src/components/AuthGuard';
import PhotoList from '@/src/components/PhotoList';
import { fetchPhotos } from '@/src/api/PhotosAPI';
import { usePhotosStore } from '@/src/store/photosStore';

export default function App() {
    const setPhotos = usePhotosStore(state => state.setPhotos);
    const setIsLoading = usePhotosStore(state => state.setIsLoading);

    useEffect(() => {
        setIsLoading(true);
        fetchPhotos()
            .then(photos => {
                if (photos) {
                    setPhotos(photos);
                }
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <Routes>
            <Route index path="/" element={<PhotoList />} />
            <Route path="/admin" element={<AuthGuard component={Admin} />} />
        </Routes>
    );
}
