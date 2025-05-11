import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'react-feather';

import { Button } from '@/src/components/Button';
import { useDeletePhotoMutation } from '../hooks/photos.query';

interface PhotoViewProps {
  photoId: string;
  photoUrl: string;
  canDelete: boolean;
}

export function PhotoView({ photoId, photoUrl, canDelete }: PhotoViewProps) {
  const [isDeleted, setIsDeleted] = useState(false);

  const { mutateAsync: deleteMutateAsync } = useDeletePhotoMutation();

  const handleDelete = async () => {
    setIsDeleted(true);
    setTimeout(async () => {
      await deleteMutateAsync(photoId);
    }, 300);
  };

  return (
    <motion.div
      className="group relative h-auto w-96"
      animate={isDeleted ? { opacity: 0 } : { opacity: 1 }}
    >
      <div className="relative transform-gpu overflow-hidden rounded-xl duration-700 will-change-transform hover:scale-110">
        <img
          src={photoUrl}
          srcSet={photoUrl}
          className="h-auto w-full"
          loading="lazy"
        />
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
    </motion.div>
  );
}
