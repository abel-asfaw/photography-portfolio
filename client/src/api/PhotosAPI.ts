import axios from 'axios';
import { Photo } from '@/src/global/types';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

const fetchPhotos = async () => {
    const response = await client.get<Photo[]>('/photos');

    return response.data;
};

const uploadPhoto = async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await client.post<Photo>('/photos', formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

const deletePhotoById = async (photoId: string, token: string) => {
    await client.delete(`/photos/${photoId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export { fetchPhotos, uploadPhoto, deletePhotoById };
