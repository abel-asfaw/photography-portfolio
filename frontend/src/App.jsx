import { useEffect } from 'react';
import PhotoUploader from './components/PhotoUploader';
import PhotoList from './components/PhotoList';
import usePhotosContext from './hooks/usePhotosContext';

export default function App() {
    const { fetchPhotosAndSync } = usePhotosContext();

    useEffect(() => {
        fetchPhotosAndSync();
    }, [fetchPhotosAndSync]);

    return (
        <div>
            <PhotoUploader />
            <PhotoList />
        </div>
    );
}
