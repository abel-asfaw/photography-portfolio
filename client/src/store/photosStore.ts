import { create } from 'zustand';

import { Photo } from '@/src/global/types';

type PhotosStore = {
    photos: Photo[];
    showSpinner: boolean;
    addPhoto: (newPhoto: Photo) => void;
    removePhoto: (photoId: string) => void;
    setPhotos: (photos: Photo[]) => void;
    setShowSpinner: (showSpinner: boolean) => void;
};

export const usePhotosStore = create<PhotosStore>(set => ({
    photos: [],
    showSpinner: false,
    addPhoto: (newPhoto: Photo) =>
        set(state => ({ photos: [newPhoto, ...state.photos] })),
    removePhoto: (photoId: string) =>
        set(state => ({
            photos: state.photos.filter(photo => photo.id !== photoId),
        })),
    setPhotos: (photos: Photo[]) => set({ photos }),
    setShowSpinner: (showSpinner: boolean) => set({ showSpinner }),
}));
