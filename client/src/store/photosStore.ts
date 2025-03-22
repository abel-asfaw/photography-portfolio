import { create } from 'zustand';

import { Photo } from '@/src/global/types';

type PhotosStore = {
    photos: Photo[];
    addPhoto: (newPhoto: Photo) => void;
    removePhoto: (photoId: string) => void;
    setPhotos: (photos: Photo[]) => void;
};

export const usePhotosStore = create<PhotosStore>(set => ({
    photos: [],
    addPhoto: (newPhoto: Photo) =>
        set(state => ({ photos: [newPhoto, ...state.photos] })),
    removePhoto: (photoId: string) =>
        set(state => ({
            photos: state.photos.filter(photo => photo.id !== photoId),
        })),
    setPhotos: (photos: Photo[]) => set({ photos }),
}));
