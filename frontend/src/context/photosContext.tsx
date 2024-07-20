import { createContext, useCallback, useState } from 'react';
import { uploadPhoto, fetchPhotos, deletePhotoById } from '../api/PhotosAPI';
import { useAuth0 } from '@auth0/auth0-react';

interface Photo {
    id: string;
    url: string;
}

interface PhotosContextType {
    photos: Photo[];
    showSpinner: boolean;
    fetchPhotosAndSync: () => void;
    uploadPhotoAndSync: (file: File) => void;
    deletePhotoAndSync: (id: string) => void;
}

interface PhotosProviderProps {
    children: React.ReactNode;
}

const PhotosContext = createContext<PhotosContextType>({
    photos: [],
    showSpinner: false,
    fetchPhotosAndSync: () => {},
    uploadPhotoAndSync: () => {},
    deletePhotoAndSync: () => {},
});

function PhotosProvider({ children }: PhotosProviderProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const { getAccessTokenSilently } = useAuth0();

    const fetchPhotosAndSync = useCallback(async () => {
        try {
            const photos = await fetchPhotos();
            setPhotos(photos);
        } catch (err) {
            console.error('Error fetching photos:', err);
        }
    }, []);

    const uploadPhotoAndSync = async (file: File) => {
        const token = await getAccessTokenSilently();
        setShowSpinner(true);
        try {
            const newPhoto = await uploadPhoto(file, token);
            setPhotos([newPhoto, ...photos]);
        } catch (err) {
            console.error('Error uploading photo:', err);
        } finally {
            setShowSpinner(false);
        }
    };

    const deletePhotoAndSync = async (id: string) => {
        const token = await getAccessTokenSilently();
        const originalPhotos = [...photos];
        try {
            setPhotos(photos.filter(photo => photo.id !== id));
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
