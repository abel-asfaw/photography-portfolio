import { createContext, useCallback, useState } from 'react';
import { uploadPhoto, fetchPhotos, deletePhotoById } from '../api/PhotosAPI';

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
        const photoToDelete = photos.find(photo => photo.id === id)
        try {
            setPhotos(photos.filter(photo => photo.id !== id));
            await deletePhotoById(id);
        } catch (err) {
            console.error('Error deleting photo:', err);
            setPhotos([...photos, photoToDelete]);
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
