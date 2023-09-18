import { useEffect } from 'react';
import PhotoUploader from './components/PhotoUploader';
import Photos from './components/Photos';
import usePhotosContext from './hooks/usePhotosContext';

export default function App() {
    const { fetchPhotosAndSync } = usePhotosContext();

    useEffect(() => {
        fetchPhotosAndSync();
    }, [fetchPhotosAndSync]);

    return (
        <div>
            <PhotoUploader />
            <Photos />
        </div>
    );
}
