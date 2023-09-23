import { createContext, useCallback, useState } from 'react';
import { uploadPhoto, fetchPhotos, deletePhotoById } from '../api/PhotosAPI';
import { useAuth0 } from '@auth0/auth0-react';

const PhotosContext = createContext({
    photos: [],
    showSpinner: false,
    fetchPhotosAndSync: async () => {},
    uploadPhotoAndSync: async () => {},
    deletePhotoAndSync: async () => {},
});

function PhotosProvider({ children }) {
    const [photos, setPhotos] = useState([]);
    const [showSpinner, setShowSpinner] = useState(false);
    const { getAccessTokenSilently } = useAuth0();

    const fetchPhotosAndSync = useCallback(async () => {
        try {
            const photos = await fetchPhotos();
            setPhotos(photos);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    }, []);

    const uploadPhotoAndSync = async file => {
        const token = await getAccessTokenSilently();
        setShowSpinner(true);
        try {
            const newPhoto = await uploadPhoto(file, token);
            setPhotos([...photos, newPhoto]);
        } catch (err) {
            console.error('Error uploading photo:', err);
        } finally {
            setShowSpinner(false);
        }
    };

    const deletePhotoAndSync = async id => {
        const token = await getAccessTokenSilently();
        const originalPhotos = [...photos];
        try {
            setPhotos(prevPhotos =>
                prevPhotos.filter(photo => photo.id !== id),
            );
            await deletePhotoById(id, token);
        } catch (err) {
            console.error('Error deleting photo:', err);
            setPhotos(originalPhotos);
        }
    };

    const photoOperations = {
        photos,
        showSpinner,
        fetchPhotosAndSync,
        uploadPhotoAndSync,
        deletePhotoAndSync,
    };

    return (
        <PhotosContext.Provider value={photoOperations}>
            {children}
        </PhotosContext.Provider>
    );
}

export { PhotosProvider };
export default PhotosContext;
