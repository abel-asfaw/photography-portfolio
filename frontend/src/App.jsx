import { useEffect, useRef } from 'react';
import FileInput from './components/FileInput';
import Photos from './components/Photos';
import usePhotosContext from './hooks/usePhotosContext';

export default function App() {
    const { photos, showSpinner, fetchPhotosAndSync } = usePhotosContext();
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchPhotosAndSync();
    }, [fetchPhotosAndSync]);

    return (
        <div>
            <FileInput fileInputRef={fileInputRef} showSpinner={showSpinner} />
            <Photos photos={photos} />
        </div>
    );
}
