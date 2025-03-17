import { createContext, useCallback, useMemo, useState } from 'react';
import { uploadPhoto, fetchPhotos, deletePhotoById } from '@/src/api/PhotosAPI';
import { useAuth0 } from '@auth0/auth0-react';
import { Photo } from '@/src/global/types';

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

export const PhotosContext = createContext<PhotosContextType>({
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
            if (!photos) {
                throw new Error('Failed to fetch photos');
            }
            setPhotos(photos);
        } catch (err) {
            console.error(err);
        }
    }, []);

    const uploadPhotoAndSync = async (file: File) => {
        const token = await getAccessTokenSilently();
        setShowSpinner(true);
        try {
            const newPhoto = await uploadPhoto(file, token);
            if (!newPhoto) {
                throw new Error('Failed to upload photo');
            }
            setPhotos([newPhoto, ...photos]);
        } catch (err) {
            console.error(err);
        } finally {
            setShowSpinner(false);
        }
    };

    const deletePhotoAndSync = async (id: string) => {
        const token = await getAccessTokenSilently();
        const originalPhotos = [...photos];
        const filteredPhotos = photos.filter(photo => photo.id !== id);
        try {
            setPhotos(filteredPhotos);
            await deletePhotoById(id, token);
        } catch (err) {
            console.error('Error deleting photo:', err);
            setPhotos(originalPhotos);
        }
    };

    const value = useMemo(
        () => ({
            photos,
            showSpinner,
            fetchPhotosAndSync,
            uploadPhotoAndSync,
            deletePhotoAndSync,
        }),
        [photos, showSpinner],
    );

    return (
        <PhotosContext.Provider value={value}>
            {children}
        </PhotosContext.Provider>
    );
}

export default PhotosProvider;
