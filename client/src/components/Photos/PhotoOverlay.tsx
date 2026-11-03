import { Image } from '@imagekit/react';
import * as stylex from '@stylexjs/stylex';
import { motion } from 'motion/react';
import { useEffect } from 'react';

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
    <div {...stylex.props(styles.overlay)}>
      <motion.div
        {...stylex.props(styles.backdrop)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onTap={onClose}
      />
      <motion.div
        layoutId={`photo-${photoId}`}
        {...stylex.props(styles.photo)}
        style={{ borderRadius: 12 }}
        layoutCrossfade={false}
      >
        {/* Same props as the grid tile so the browser reuses the cached
            image, and auto sizing so the box always matches its shape. */}
        <Image
          urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
          src={`/${photoName}`}
          loading="eager"
          height={600}
          width={600}
          sizes="600px"
          {...stylex.props(styles.image)}
        />
      </motion.div>
    </div>
  );
}

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgb(0 0 0 / 0.8)',
    backdropFilter: 'blur(8px)',
  },
  photo: {
    position: 'relative',
    zIndex: 10,
    maxHeight: '100%',
    maxWidth: '90vw',
    overflow: 'hidden',
  },
  image: {
    width: 'auto',
    height: 'auto',
    maxWidth: '90vw',
    maxHeight: '90vh',
  },
});
