import classNames from 'classnames';
import { useState } from 'react';
import { X } from 'react-feather';

import { Image } from '@imagekit/react';

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
    }, 200);
  };

  const classes = classNames('group relative h-auto w-96 duration-500', {
    'opacity-0': isDeleted,
  });

  return (
    <div className={classes}>
      <div className="relative transform-gpu overflow-hidden rounded-xl backdrop-blur-2xl duration-700 will-change-transform hover:scale-110">
        <Image
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
          src={`/${photoName}`}
          loading="lazy"
          height={600}
          width={600}
        />
        {canDelete && (
          <Button
            primary
            circular
            onClick={handleDelete}
            className="absolute top-2 right-2 opacity-0 shadow-sm shadow-zinc-700 group-hover:opacity-100"
          >
            <X size={12} color="black" />
          </Button>
        )}
      </div>
    </div>
  );
}
