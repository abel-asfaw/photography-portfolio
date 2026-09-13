import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { AnimatePresence } from 'motion/react';
import { PropsWithChildren, useEffect, useState } from 'react';

import { PhotoOverlay } from './PhotoOverlay';
import { PhotoView } from './PhotoView';
import { SortablePhotoView } from './SortablePhotoView';
import { Photo } from '@/src/api/schemas/photos.schema';
import {
  useFetchPhotos,
  useReorderPhotos,
} from '@/src/api/services/photos.query';

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
  const { mutate: reorder } = useReorderPhotos();
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos ?? []);
  const [selectedPhoto, setSelectedPhoto] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (photos) setLocalPhotos(photos);
  }, [photos]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localPhotos.findIndex(p => p.id === active.id);
    const newIndex = localPhotos.findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newOrder = arrayMove(localPhotos, oldIndex, newIndex);
    setLocalPhotos(newOrder);
    reorder(newOrder.map(p => p.id));
  };

  if (isAuthenticated) {
    return (
      <>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          modifiers={[restrictToParentElement]}
          onDragEnd={handleDragEnd}
        >
          <div className="flex grow flex-wrap items-stretch justify-center gap-12 px-10 pt-10 pb-2 text-neutral-200 sm:gap-16 sm:px-20 sm:pt-20 sm:pb-12">
            {localPhotos.length > 0 ? (
              <SortableContext
                items={localPhotos.map(p => p.id)}
                strategy={rectSortingStrategy}
              >
                {localPhotos.map(({ id, name }) => (
                  <SortablePhotoView
                    key={id}
                    photoId={id}
                    photoName={name}
                    onSelect={(photoId, photoName) =>
                      setSelectedPhoto({ id: photoId, name: photoName })
                    }
                  />
                ))}
              </SortableContext>
            ) : (
              'No photos to display...'
            )}
          </div>
        </DndContext>
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

  return (
    <>
      <PhotosListWrapper>
        {photos.length > 0
          ? photos.map(({ id, name }) => (
              <PhotoView
                key={id}
                photoName={name}
                photoId={id}
                canDelete={false}
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
