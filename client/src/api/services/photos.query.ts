import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Photo } from '@/src/api/schemas/photos.schema';
import {
  deletePhotos,
  deletePhotosOnExit,
  fetchPhotos,
  reorderPhotos,
  uploadPhoto,
} from '@/src/api/services/photos.api';

const PHOTOS_KEY = ['photos'];

export const useFetchPhotos = () =>
  useQuery({
    queryKey: PHOTOS_KEY,
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

export const useUploadPhoto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      onProgress,
    }: {
      file: File;
      onProgress?: (fraction: number) => void;
    }) => uploadPhoto(file, onProgress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PHOTOS_KEY }),
  });
};

/**
 * Deletes several photos in one request and refreshes the photo list once
 * it settles, so any that failed come back. `keepalive` sends it so it
 * survives the page closing.
 */
export const useDeletePhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      photoIds,
      keepalive = false,
    }: {
      photoIds: string[];
      keepalive?: boolean;
    }) => (keepalive ? deletePhotosOnExit : deletePhotos)(photoIds),
    onSettled: () => queryClient.invalidateQueries({ queryKey: PHOTOS_KEY }),
  });
};

/** Returns `photos` arranged in the order of `photoIds`. */
export const orderByIds = (photos: Photo[], photoIds: string[]) => {
  const byId = new Map(photos.map(photo => [photo.id, photo]));
  return photoIds.flatMap(id => byId.get(id) ?? []);
};

const REORDER_KEY = ['photos', 'reorder'];

/**
 * Callers keep their own optimistic order for a smooth drag; the cache is
 * updated too so every other reader of the photo list sees the new order.
 *
 * The caller's list can be a moment behind the server (an upload just
 * finished, a delete just went through); the API fits the order to its own
 * list and returns what it saved. Saves run one at a time so they reach the
 * server in the order made.
 */
export const useReorderPhotos = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: REORDER_KEY,
    scope: { id: 'reorder-photos' },
    mutationFn: (photoIds: string[]) => reorderPhotos(photoIds),
    onMutate: async (photoIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: PHOTOS_KEY });
      const previous = queryClient.getQueryData<Photo[]>(PHOTOS_KEY);
      if (previous) {
        queryClient.setQueryData(PHOTOS_KEY, orderByIds(previous, photoIds));
      }
      return { previous };
    },
    onSuccess: saved => {
      // Show what the server saved, unless a later save is already queued
      // to replace it.
      if (queryClient.isMutating({ mutationKey: REORDER_KEY }) <= 1) {
        queryClient.setQueryData(PHOTOS_KEY, saved);
      }
    },
    onError: (_error, _photoIds, context) => {
      if (context?.previous) {
        queryClient.setQueryData(PHOTOS_KEY, context.previous);
      }
      void queryClient.invalidateQueries({ queryKey: PHOTOS_KEY });
    },
  });
};
