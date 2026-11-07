import { apiClient } from '@/src/api/apiClient';
import {
  GetPhotosResponseSchema,
  type Photo,
  PhotoSchema,
} from '@/src/api/schemas/photos.schema';
import { useSession } from '@/src/api/supabase';

export const fetchPhotos = async () => {
  const response = await apiClient.get('/photos');

  return GetPhotosResponseSchema.parse(response.data);
};

/** Uploads one photo, reporting progress as a fraction from 0 to 1. */
export const uploadPhoto = async (
  file: File,
  onProgress?: (fraction: number) => void,
) => {
  const formData = new FormData();
  formData.append('file', file, file.name);
  const response = await apiClient.post<Photo>('/photos', formData, {
    onUploadProgress: event => {
      if (event.total) onProgress?.(event.loaded / event.total);
    },
  });

  return PhotoSchema.parse(response.data);
};

export const deletePhotos = async (photoIds: string[]) => {
  await apiClient.delete('/photos', { data: { photo_ids: photoIds } });
};

/**
 * Deletes photos with a keepalive request, which outlives the page, for
 * sending as the page is hidden. It skips apiClient: its interceptor reads
 * the token asynchronously, too late for a page that is closing, so the
 * token comes from the session store instead.
 */
export const deletePhotosOnExit = async (photoIds: string[]) => {
  const token = useSession.getState().session?.access_token;
  const base = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  const response = await fetch(`${base}/photos`, {
    method: 'DELETE',
    keepalive: true,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ photo_ids: photoIds }),
  });
  if (!response.ok) {
    throw new Error(`Failed to delete photos: ${response.status}`);
  }
};

/**
 * Saves an order. The API puts any photos the list leaves out after it and
 * ignores unknown ids, then returns the order it saved.
 */
export const reorderPhotos = async (photoIds: string[]) => {
  const response = await apiClient.put('/photos/reorder', {
    photo_ids: photoIds,
  });

  return GetPhotosResponseSchema.parse(response.data);
};
