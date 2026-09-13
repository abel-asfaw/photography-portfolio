import {
  useSortable,
  defaultAnimateLayoutChanges,
  AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { PhotoView } from './PhotoView';

const animateLayoutChanges: AnimateLayoutChanges = args => {
  if (args.wasDragging) return false;
  return defaultAnimateLayoutChanges(args);
};

interface SortablePhotoViewProps {
  photoId: string;
  photoName: string;
  onSelect: (photoId: string, photoName: string) => void;
}

export function SortablePhotoView({
  photoId,
  photoName,
  onSelect,
}: SortablePhotoViewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photoId, animateLayoutChanges });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-center"
      {...attributes}
      {...listeners}
    >
      <PhotoView
        photoId={photoId}
        photoName={photoName}
        canDelete={true}
        onSelect={onSelect}
        disableLayoutId
      />
    </div>
  );
}
