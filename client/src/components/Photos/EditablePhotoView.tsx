import {
  useSortable,
  defaultAnimateLayoutChanges,
  AnimateLayoutChanges,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as stylex from '@stylexjs/stylex';

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
      {...stylex.props(styles.sortable)}
      style={style}
      {...attributes}
      {...listeners}
    >
      <PhotoView photoName={photoName} onDelete={() => deletePhoto(photoId)} />
    </div>
  );
}

const styles = stylex.create({
  sortable: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
