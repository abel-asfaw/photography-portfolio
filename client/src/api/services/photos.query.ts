import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Photo } from '@/src/api/schemas/photos.schema';
import {
  deletePhotoById,
  fetchPhotos,
  reorderPhotos,
  uploadPhotos,
} from '@/src/api/services/photos.api';

const PHOTOS_KEY = ['photos'];

export const useFetchPhotos = () =>
  useQuery({
    queryKey: PHOTOS_KEY,
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export const useUploadPhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (files: FileList) => uploadPhotos(files),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PHOTOS_KEY }),
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => deletePhotoById(photoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PHOTOS_KEY }),
  });
};

/** Returns `photos` arranged in the order of `photoIds`. */
export const orderByIds = (photos: Photo[], photoIds: string[]) => {
  const byId = new Map(photos.map(photo => [photo.id, photo]));
  return photoIds.flatMap(id => byId.get(id) ?? []);
};

/**
 * Callers keep their own optimistic order for a smooth drag; the cache is
 * updated too so every other reader of the photo list sees the new order.
 */
export const useReorderPhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoIds: string[]) => reorderPhotos(photoIds),
    onMutate: async (photoIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: PHOTOS_KEY });
      const previous = queryClient.getQueryData<Photo[]>(PHOTOS_KEY);
      if (previous) {
        queryClient.setQueryData(PHOTOS_KEY, orderByIds(previous, photoIds));
      }
      return { previous };
    },
    onError: (_error, _photoIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PHOTOS_KEY, context.previous);
      }
      void queryClient.invalidateQueries({ queryKey: PHOTOS_KEY });
    },
  });
};
