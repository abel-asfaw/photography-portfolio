import {
  useSortable,
  defaultAnimateLayoutChanges,
  AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { useDeletePhoto } from '@/src/api/services/photos.query';

import { PhotoView } from './PhotoView';

const animateLayoutChanges: AnimateLayoutChanges = args => {
  if (args.wasDragging) return false;
  return defaultAnimateLayoutChanges(args);
};

interface EditablePhotoViewProps {
  photoId: string;
  photoName: string;
}

export function EditablePhotoView({
  photoId,
  photoName,
}: EditablePhotoViewProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photoId, animateLayoutChanges });
  const { mutateAsync: deletePhoto } = useDeletePhoto();

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
        onDelete={() => deletePhoto(photoId)}
      />
    </div>
  );
}
