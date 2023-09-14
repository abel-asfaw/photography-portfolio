import { useState, createContext, useCallback } from 'react';
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

    const savePhotosToLocalStorage = photos => {
        localStorage.setItem('photos', JSON.stringify(photos));
    };

    const getPhotosFromLocalStorage = () => {
        return JSON.parse(localStorage.getItem('photos') || '[]');
    };

    const fetchPhotosAndSync = useCallback(async () => {
        try {
            let photos;
            const localData = getPhotosFromLocalStorage();
            if (localData) {
                photos = localData;
            } else {
                photos = await fetchPhotos();
                savePhotosToLocalStorage(photos);
            }
            setPhotos(photos);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    }, []);

    const uploadPhotoAndSync = async file => {
        setShowSpinner(true);
        try {
            const newPhoto = await uploadPhoto(file);
            const updatedPhotos = [...photos, newPhoto];
            setPhotos(updatedPhotos);
            savePhotosToLocalStorage(updatedPhotos);
        } catch (err) {
            console.error('Error uploading photo:', err);
        } finally {
            setShowSpinner(false);
        }
    };

    const deletePhotoAndSync = async id => {
        try {
            await deletePhotoById(id);
            const updatedPhotos = photos.filter(photo => photo.id !== id);
            setPhotos(updatedPhotos);
            savePhotosToLocalStorage(updatedPhotos);
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
