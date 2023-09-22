import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/photos`;

export const uploadPhoto = async file => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await axios.post(API_BASE_URL, formData);

    return response.data;
};

export const fetchPhotos = async () => {
    const response = await axios.get(API_BASE_URL);

    return response.data;
};

export const deletePhotoById = async photoId => {
    await axios.delete(`${API_BASE_URL}/${photoId}`);
};
