import { AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { Photo } from '@/src/api/schemas/photos.schema';
import { useFetchPhotos } from '@/src/api/services/photos.query';

import { PhotoGrid } from './PhotoGrid';
import { PhotoOverlay } from './PhotoOverlay';
import { PhotoView } from './PhotoView';

/** The public, read-only gallery. Tapping a photo opens it full size. */
export function PhotoList() {
  const { data: photos, isLoading, isError } = useFetchPhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      <PhotoGrid photos={photos} isLoading={isLoading} isError={isError}>
        {photos?.map(photo => (
          <PhotoView
            key={photo.id}
            photoId={photo.id}
            photoName={photo.name}
            isSelected={selectedPhoto?.id === photo.id}
            onSelect={() => setSelectedPhoto(photo)}
          />
        ))}
      </PhotoGrid>
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
