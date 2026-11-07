import type { Photo } from '@/src/api/schemas/photos.schema';

interface PhotosStatus {
  photos: Photo[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

/** The loading, error or empty message for a photo list, or null with photos. */
export const statusMessage = ({ photos, isLoading, isError }: PhotosStatus) => {
  if (photos) return photos.length > 0 ? null : 'No photos to display…';
  if (isLoading) return 'Loading…';
  if (isError) return 'Failed to load photos. Please try again.';
  return '';
};
