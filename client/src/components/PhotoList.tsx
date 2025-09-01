import { PropsWithChildren } from 'react';

import { PhotoView } from '@/src/components/PhotoView';
import { useFetchPhotos } from '@/src/hooks/photos.query';

function PhotosListWrapper({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-grow flex-wrap items-center justify-center gap-16 px-10 pt-10 pb-2 text-neutral-200 sm:px-20 sm:pt-20 sm:pb-12">
      {children}
    </div>
  );
}

interface PhotoListProps {
  isAuthenticated?: boolean;
}

export function PhotoList({ isAuthenticated = false }: PhotoListProps) {
  const { data: photos, isLoading, isError } = useFetchPhotos();

  if (!photos) {
    return (
      <PhotosListWrapper>
        {isLoading
          ? 'Loading...'
          : isError
            ? 'Failed to load photos. Please try again.'
            : ''}
      </PhotosListWrapper>
    );
  }

  return (
    <PhotosListWrapper>
      {photos.length > 0
        ? photos.map(({ id, name }) => (
            <PhotoView
              key={id}
              photoName={name}
              photoId={id}
              canDelete={isAuthenticated}
            />
          ))
        : 'No photos to display...'}
    </PhotosListWrapper>
  );
}
