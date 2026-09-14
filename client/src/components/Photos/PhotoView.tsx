import { Image } from '@imagekit/react';
import classNames from 'classnames';
import { motion } from 'motion/react';
import { MouseEvent, useEffect, useState } from 'react';
import { X } from 'react-feather';

import { useDeletePhoto } from '@/src/api/services/photos.query';
import { Button } from '@/src/components/ui';

interface PhotoViewProps {
  photoId: string;
  photoName: string;
  canDelete: boolean;
  onSelect: (photoId: string, photoName: string) => void;
  disableLayoutId?: boolean;
  isSelected?: boolean;
}

export function PhotoView({
  photoId,
  photoName,
  canDelete,
  onSelect,
  disableLayoutId = false,
  isSelected = false,
}: PhotoViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  // Keep the tile above its siblings while it flies to/from the overlay.
  // Raised on select; lowered only once the return layout animation ends.
  const [isRaised, setIsRaised] = useState(false);

  useEffect(() => {
    if (isSelected) setIsRaised(true);
  }, [isSelected]);

  const { mutateAsync: deletePhoto } = useDeletePhoto();

  const handleDelete = async (e: MouseEvent<HTMLButtonElement>) => {
    setIsDeleted(true);
    setTimeout(async () => {
      await deletePhoto(photoId);
    }, 200);
  };

  const classes = classNames(
    'group relative h-auto w-96 duration-500 sm:w-72',
    {
      'opacity-0': isDeleted,
      'z-40': isRaised,
    },
  );

  return (
    <div
      className={classNames(classes, 'hover:scale-[1.1]')}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layoutId={disableLayoutId ? undefined : `photo-${photoId}`}
        className="relative transform-gpu overflow-hidden rounded-xl will-change-transform hover:cursor-pointer"
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
        }}
        onTap={() => !disableLayoutId && onSelect(photoId, photoName)}
        onLayoutAnimationComplete={() => {
          if (!isSelected) setIsRaised(false);
        }}
      >
        <Image
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
          src={`/${photoName}`}
          loading="eager"
          height={600}
          width={600}
          sizes="600px"
        />
        {canDelete && isHovered ? (
          <Button
            primary
            circular
            onPointerDownCapture={e => e.stopPropagation()}
            onClick={handleDelete}
            className="absolute top-2 right-2 shadow-sm shadow-zinc-700 hover:cursor-pointer"
          >
            <X size={12} color="black" />
          </Button>
        ) : null}
      </motion.div>
    </div>
  );
}
