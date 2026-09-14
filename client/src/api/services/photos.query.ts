import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  deletePhotoById,
  fetchPhotos,
  reorderPhotos,
  uploadPhotos,
} from '@/src/api/services/photos.api';

export const useFetchPhotos = () =>
  useQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export const useUploadPhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: FileList) => uploadPhotos(files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => deletePhotoById(photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photos'] }),
  });
};

export const useReorderPhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoIds: string[]) => reorderPhotos(photoIds),
    onError: () => {
      void queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
  });
};
