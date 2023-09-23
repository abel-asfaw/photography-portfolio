import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/photos`;

const fetchPhotos = async () => {
    const response = await axios.get(API_BASE_URL);

    return response.data;
};

const uploadPhoto = async (file, token) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const response = await axios.post(API_BASE_URL, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

const deletePhotoById = async (photoId, token) => {
    await axios.delete(`${API_BASE_URL}/${photoId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export { uploadPhoto, fetchPhotos, deletePhotoById };
