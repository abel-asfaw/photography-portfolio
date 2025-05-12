import { useMutation, useQuery } from '@tanstack/react-query';

import { deletePhotoById, fetchPhotos, uploadPhoto } from '../api/photos.api';
import { queryClient } from '../App';

export const useFetchPhotosQuery = () =>
  useQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export const useUploadPhotoMutation = () =>
  useMutation({
    mutationFn: (file: File) => uploadPhoto(file),
  });

export const useDeletePhotoMutation = () =>
  useMutation({
    mutationFn: (photoId: string) => deletePhotoById(photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  });
