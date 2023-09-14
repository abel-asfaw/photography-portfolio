import { createContext, useCallback, useState } from 'react';
import { deletePhotoById, fetchPhotos, uploadPhoto } from '../api/PhotosAPI';

const PhotosContext = createContext({
    photos: [],
    showSpinner: false,
    fetchPhotosAndSync: async () => {},
    uploadPhotoAndSync: async () => {},
    deletePhotoAndSync: async () => {},
});

function Provider({ children }) {
    const [photos, setPhotos] = useState([]);
    const [showSpinner, setShowSpinner] = useState(false);

    const fetchPhotosAndSync = useCallback(async () => {
        try {
            const photos = await fetchPhotos();
            setPhotos(photos);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    }, []);

    const uploadPhotoAndSync = async file => {
        setShowSpinner(true);
        try {
            const newPhoto = await uploadPhoto(file);
            setPhotos([...photos, newPhoto]);
        } catch (err) {
            console.error('Error uploading photo:', err);
        } finally {
            setShowSpinner(false);
        }
    };

    const deletePhotoAndSync = async id => {
        try {
            await deletePhotoById(id);
            setPhotos(photos.filter(photo => photo.id !== id));
        } catch (err) {
            console.error('Error deleting photo:', err);
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

export { Provider };
export default PhotosContext;
