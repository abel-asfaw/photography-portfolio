import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { PhotoView } from '@/src/components/PhotoView';
import { usePhotosAPI } from '@/src/hooks/usePhotosAPI';
import { usePhotosStore } from '@/src/store/photosStore';

interface PhotoListProps {
  isAuthenticated?: boolean;
}

export function PhotoList({ isAuthenticated = false }: PhotoListProps) {
  const { fetchPhotos } = usePhotosAPI();

  const photos = usePhotosStore(state => state.photos);
  const setPhotos = usePhotosStore(state => state.setPhotos);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['photos'],
    queryFn: fetchPhotos,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    if (!isLoading && !isError && data) {
      setPhotos(data);
    }
  }, [data, isLoading, isError]);

  const renderedPhotos = photos?.map(({ id, url }) => (
    <PhotoView
      key={id}
      photoId={id}
      photoUrl={url}
      canDelete={isAuthenticated}
    />
  ));

  return (
    <div className="flex flex-grow flex-wrap items-center justify-center gap-16 px-10 pb-2 pt-10 text-neutral-200 sm:px-20 sm:pb-12 sm:pt-20">
      {isLoading
        ? 'Loading...'
        : isError
        ? 'Failed to load photos. Please try again.'
        : renderedPhotos?.length
        ? renderedPhotos
        : 'No photos to display...'}
    </div>
  );
}
