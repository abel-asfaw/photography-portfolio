import axios from 'axios';

import { useAuth0 } from '@auth0/auth0-react';

import { Photo } from '@/src/global/types';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

export function usePhotosAPI() {
    const { getAccessTokenSilently } = useAuth0();

    const fetchPhotos = async () => {
        try {
            const response = await axiosClient.get<Photo[]>('/photos');
            return response.data;
        } catch {
            alert('Failed to retrieve photos. Please try again.');
        }
    };

    const uploadPhoto = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file, file.name);
        try {
            const token = await getAccessTokenSilently();
            console.log(token);
            const response = await axiosClient.post<Photo>(
                '/photos',
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            return response.data;
        } catch {
            alert('Failed to upload photo. Please try again.');
        }
    };

    const deletePhotoById = async (photoId: string) => {
        try {
            const token = await getAccessTokenSilently();
            console.log(token);
            const response = await axiosClient.delete(`/photos/${photoId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.status;
        } catch {
            alert('Failed to delete photo. Please try again. ');
        }
    };

    return { fetchPhotos, uploadPhoto, deletePhotoById };
}
