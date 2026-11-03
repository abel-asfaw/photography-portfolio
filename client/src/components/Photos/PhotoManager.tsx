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
import { useState } from 'react';

import { Photo } from '@/src/api/schemas/photos.schema';
import {
  useFetchPhotos,
  useReorderPhotos,
} from '@/src/api/services/photos.query';

import { EditablePhotoView } from './EditablePhotoView';
import { PhotoGrid } from './PhotoGrid';
import { PhotoUploader } from './PhotoUploader';

/**
 * The admin editor: upload new photos, drag to reorder, and delete.
 * The uploader stays available while the list loads or fails to load.
 */
export function PhotoManager() {
  const { data: photos, isLoading, isError } = useFetchPhotos();
  const { mutate: reorder } = useReorderPhotos();
  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos ?? []);
  const [syncedPhotos, setSyncedPhotos] = useState(photos);

  // Re-seed the optimistic local order whenever the server list changes.
  // Done during render rather than in an effect so there is no extra
  // commit showing stale order in between.
  if (photos && photos !== syncedPhotos) {
    setSyncedPhotos(photos);
    setLocalPhotos(photos);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

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

  return (
    <>
      <PhotoUploader />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <PhotoGrid
          photos={photos}
          isLoading={isLoading}
          isError={isError}
          stretch
        >
          <SortableContext
            items={localPhotos.map(p => p.id)}
            strategy={rectSortingStrategy}
          >
            {localPhotos.map(({ id, name }) => (
              <EditablePhotoView key={id} photoId={id} photoName={name} />
            ))}
          </SortableContext>
        </PhotoGrid>
      </DndContext>
    </>
  );
}
