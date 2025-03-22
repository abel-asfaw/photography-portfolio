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
        alert('Failed to retrieve photos. Please try again.');
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
        alert('Failed to upload photo. Please try again.');
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
        alert('Failed to delete photo. Please try again. ');
    }
};

export { fetchPhotos, uploadPhoto, deletePhotoById };
