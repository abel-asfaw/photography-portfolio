import { apiClient } from '../apiClient';
import {
  GetPhotosResponseSchema,
  PhotoSchema,
  Photo,
} from '../schemas/photos.schema';

export const fetchPhotos = async () => {
  const response = await apiClient.get('/photos');

  return GetPhotosResponseSchema.parse(response.data);
};

export const uploadPhoto = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file, file.name);
  const response = await apiClient.post<Photo>('/photos', formData);

  return PhotoSchema.parse(response.data);
};

export const uploadPhotos = async (files: FileList) => {
  return Promise.all(Array.from(files).map(file => uploadPhoto(file)));
};

export const deletePhotoById = async (photoId: string) => {
  await apiClient.delete(`/photos/${photoId}`);
};
