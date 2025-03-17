import { useContext } from 'react';
import { PhotosContext } from '@/src/context/photosContext';

export default function usePhotosContext() {
    return useContext(PhotosContext);
}
