import { useMutation, useQuery } from '@tanstack/react-query';

import {
  deletePhotoById,
  fetchPhotos,
  uploadPhotos,
} from '@/src/api/services/photos.api';
import { queryClient } from '../../App';

export const useFetchPhotos = () =>
  useQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export const useUploadPhotos = () =>
  useMutation({
    mutationFn: (files: FileList) => uploadPhotos(files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  });

export const useDeletePhoto = () =>
  useMutation({
    mutationFn: (photoId: string) => deletePhotoById(photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  });
