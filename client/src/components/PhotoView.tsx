import classNames from 'classnames';
import { useState } from 'react';
import { X } from 'react-feather';

import { Button } from '@/src/components/Button';
import { useDeletePhoto } from '../hooks/photos.query';

interface PhotoViewProps {
  photoId: string;
  photoName: string;
  canDelete: boolean;
}

export function PhotoView({ photoId, photoName, canDelete }: PhotoViewProps) {
  const [isDeleted, setIsDeleted] = useState(false);

  const { mutateAsync: deletePhoto } = useDeletePhoto();

  const handleDelete = async () => {
    setIsDeleted(true);
    setTimeout(async () => {
      await deletePhoto(photoId);
    }, 300);
  };

  const classes = classNames('group relative h-auto w-96 duration-500', {
    'opacity-0': isDeleted,
  });

  const url = `${import.meta.env.VITE_IMAGE_KIT_URL}/${photoName}`;

  return (
    <div className={classes}>
      <div className="relative transform-gpu overflow-hidden rounded-xl duration-700 will-change-transform hover:scale-110">
        <img src={url} srcSet={url} className="h-auto w-full" loading="lazy" />
        {canDelete && (
          <Button
            primary
            circular
            onClick={handleDelete}
            className="absolute right-2 top-2 opacity-0 shadow-sm shadow-zinc-700 group-hover:opacity-100"
          >
            <X size={12} color="black" />
          </Button>
        )}
      </div>
    </div>
  );
}
