import { useContext } from 'react';
import PhotosContext from '../context/photosContext';

export default function usePhotosContext() {
    return useContext(PhotosContext);
}
