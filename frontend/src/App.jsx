import { useEffect } from 'react';
import FileInput from './components/FileInput';
import Photos from './components/Photos';
import usePhotosContext from './hooks/usePhotosContext';

export default function App() {
    const { fetchPhotosAndSync } = usePhotosContext();

    useEffect(() => {
        fetchPhotosAndSync();
    }, [fetchPhotosAndSync]);

    return (
        <div>
            <FileInput />
            <Photos />
        </div>
    );
}
