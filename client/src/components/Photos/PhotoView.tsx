import { Image } from '@imagekit/react';
import classNames from 'classnames';
import { motion } from 'motion/react';
import { useState } from 'react';
import { X } from 'react-feather';

import { Button } from '@/src/components/ui';

interface PhotoViewProps {
  photoId: string;
  photoName: string;
  /** Opens the photo full size; also enables the shared-layout animation. */
  onSelect?: () => void;
  /** Shows a delete button on hover. */
  onDelete?: () => Promise<unknown>;
  isSelected?: boolean;
}

export function PhotoView({
  photoId,
  photoName,
  onSelect,
  onDelete,
  isSelected = false,
}: PhotoViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  // Keep the tile above its siblings while it flies to/from the overlay.
  // Raised on select; lowered only once the return layout animation ends.
  const [isRaised, setIsRaised] = useState(false);
  if (isSelected && !isRaised) setIsRaised(true);

  const handleDelete = () => {
    if (!onDelete) return;
    // Fade out first, then delete; bring the tile back if the delete fails.
    setIsDeleted(true);
    setTimeout(async () => {
      try {
        await onDelete();
      } catch (error) {
        console.error('Failed to delete photo', error);
        setIsDeleted(false);
      }
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
        layoutId={onSelect ? `photo-${photoId}` : undefined}
        className="relative transform-gpu overflow-hidden rounded-xl will-change-transform hover:cursor-pointer"
        transition={{
          type: 'spring',
          stiffness: 150,
          damping: 20,
        }}
        onTap={onSelect}
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
        {onDelete && isHovered ? (
          <Button
            primary
            circular
            aria-label="Delete photo"
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
