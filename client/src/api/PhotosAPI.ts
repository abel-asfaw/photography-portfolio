import axios from 'axios';

import { Photo } from '@/src/global/types';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

const fetchPhotos = async () => {
    try {
        const response = await client.get<Photo[]>('/photos');
        return response.data;
    } catch {
        console.error('Failed to retrieve photos.');
    }
};

const uploadPhoto = async (file: File, token: string) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    try {
        const response = await client.post<Photo>('/photos', formData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch {
        console.error('Failed to upload photo.');
    }
};

const deletePhotoById = async (photoId: string, token: string) => {
    try {
        const response = await client.delete(`/photos/${photoId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.status;
    } catch {
        console.error('Failed to delete photo.');
    }
};

export { fetchPhotos, uploadPhoto, deletePhotoById };
