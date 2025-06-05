import { Photo } from '../global/types';
import { apiClient } from './apiClient';

export const fetchPhotos = async () => {
  const response = await apiClient.get<Photo[]>('/photos');
  return response.data;
};

export const uploadPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file, file.name);
  const response = await apiClient.post<Photo>('/photos', formData);
  return response.data;
};

export const deletePhotoById = async (photoId: string) => {
  const response = await apiClient.delete(`/photos/${photoId}`);
  return response.status;
};
