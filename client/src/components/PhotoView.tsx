import classNames from 'classnames';
import { motion } from 'motion/react';
import { MouseEvent, useState } from 'react';
import { X } from 'react-feather';

import { Image } from '@imagekit/react';

import { Button } from '@/src/components/Button';
import { useDeletePhoto } from '@/src/api/services/photos.query';

interface PhotoViewProps {
  photoId: string;
  photoName: string;
  canDelete: boolean;
  onSelect: (photoId: string, photoName: string) => void;
}

export function PhotoView({
  photoId,
  photoName,
  canDelete,
  onSelect,
}: PhotoViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const { mutateAsync: deletePhoto } = useDeletePhoto();

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsDeleted(true);
    setTimeout(async () => {
      await deletePhoto(photoId);
    }, 200);
  };

  const classes = classNames(
    'group relative h-auto sm:w-72 w-96 duration-500',
    {
      'opacity-0': isDeleted,
    },
  );

  return (
    <div
      className={classes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layoutId={`photo-${photoId}`}
        className="relative transform-gpu overflow-hidden rounded-xl will-change-transform hover:cursor-pointer"
        whileHover={{ scale: 1.1 }}
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
        }}
        onTap={() => onSelect(photoId, photoName)}
      >
        <Image
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
          src={`/${photoName}`}
          loading="eager"
          height={600}
          width={600}
        />
        {canDelete && isHovered ? (
          <Button
            primary
            circular
            onClick={handleDelete}
            onPointerDownCapture={e => e.stopPropagation()}
            className="absolute top-2 right-2 shadow-sm shadow-zinc-700 hover:cursor-pointer"
          >
            <X size={12} color="black" />
          </Button>
        ) : null}
      </motion.div>
    </div>
  );
}
