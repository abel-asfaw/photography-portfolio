import { Image } from '@imagekit/react';
import * as stylex from '@stylexjs/stylex';
import { motion } from 'motion/react';
import { useState } from 'react';
import { X } from 'react-feather';

import { Button } from '@/src/components/ui';
import { breakpoints } from '@/src/styles/tokens.stylex';

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
  // Keep the tile above the overlay (z-50) while it flies back from it, or
  // the overlay's backdrop-blur blurs it. Tracked from select so the raise
  // starts on deselect; lowered only once the return animation ends. Not
  // raised while selected: the tile is hidden then, but its wrapper would
  // still catch clicks meant for the backdrop.
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

  return (
    <div
      {...stylex.props(
        styles.tile,
        isDeleted && styles.deleted,
        isRaised && !isSelected && styles.raised,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        layoutId={onSelect ? `photo-${photoId}` : undefined}
        {...stylex.props(styles.photo)}
        // Set inline (not via rounded-xl) so Motion can correct the radius
        // for scale distortion during the layout animation.
        style={{ borderRadius: 12 }}
        // Hide the other copy instead of crossfading, so only the copy
        // above the backdrop is visible in flight.
        layoutCrossfade={false}
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
            xstyle={styles.deleteButton}
          >
            <X size={12} color="black" />
          </Button>
        ) : null}
      </motion.div>
    </div>
  );
}

const styles = stylex.create({
  tile: {
    position: 'relative',
    width: { default: '24rem', [breakpoints.sm]: '18rem' },
    scale: { default: null, ':hover': 1.1 },
    // Transition only opacity and scale; an implicit `all` would also
    // tween z-index, leaving the tile under the backdrop for a moment.
    transitionProperty: 'opacity, scale',
    transitionDuration: '500ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  deleted: {
    opacity: 0,
  },
  raised: {
    zIndex: 60,
  },
  photo: {
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  deleteButton: {
    position: 'absolute',
    top: '0.5rem',
    right: '0.5rem',
    cursor: 'pointer',
    boxShadow: '0 1px 3px 0 #3f3f46, 0 1px 2px -1px #3f3f46',
  },
});
