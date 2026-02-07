import { useEffect } from 'react';
import { motion } from 'motion/react';

import { Image } from '@imagekit/react';

interface PhotoOverlayProps {
  photoId: string;
  photoName: string;
  onClose: () => void;
}

export function PhotoOverlay({
  photoId,
  photoName,
  onClose,
}: PhotoOverlayProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.div
        layoutId={`photo-${photoId}`}
        className="relative z-10 max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl"
        onClick={e => e.stopPropagation()}
      >
        <Image
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
          src={`/${photoName}`}
          loading="eager"
          height={600}
          width={600}
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </motion.div>
    </div>
  );
}
