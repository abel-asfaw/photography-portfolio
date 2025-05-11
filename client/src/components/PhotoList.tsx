import { PhotoView } from '@/src/components/PhotoView';
import { useFetchPhotosQuery } from '@/src/hooks/photos.query';

interface PhotoListProps {
  isAuthenticated?: boolean;
}

export function PhotoList({ isAuthenticated = false }: PhotoListProps) {
  const { data: photos, isLoading, isError } = useFetchPhotosQuery();

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
