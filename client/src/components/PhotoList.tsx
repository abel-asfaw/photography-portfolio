import { AnimatePresence } from 'motion/react';
import { PropsWithChildren, useState } from 'react';

import { PhotoOverlay } from '@/src/components/PhotoOverlay';
import { PhotoView } from '@/src/components/PhotoView';
import { useFetchPhotos } from '@/src/hooks/photos.query';

function PhotosListWrapper({ children }: PropsWithChildren) {
  return (
    <div className="flex grow flex-wrap items-center justify-center gap-12 px-10 pt-10 pb-2 text-neutral-200 sm:gap-16 sm:px-20 sm:pt-20 sm:pb-12">
      {children}
    </div>
  );
}

interface PhotoListProps {
  isAuthenticated?: boolean;
}

export function PhotoList({ isAuthenticated = false }: PhotoListProps) {
  const { data: photos, isLoading, isError } = useFetchPhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<{
    id: string;
    name: string;
  } | null>(null);

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
    <>
      <PhotosListWrapper>
        {photos.length > 0
          ? photos.map(({ id, name }) => (
              <PhotoView
                key={id}
                photoName={name}
                photoId={id}
                canDelete={isAuthenticated}
                onSelect={(photoId, photoName) =>
                  setSelectedPhoto({ id: photoId, name: photoName })
                }
              />
            ))
          : 'No photos to display...'}
      </PhotosListWrapper>
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoOverlay
            photoId={selectedPhoto.id}
            photoName={selectedPhoto.name}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
