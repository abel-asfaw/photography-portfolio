import { Image } from '@imagekit/react';
import * as stylex from '@stylexjs/stylex';
import { motion } from 'motion/react';
import { useState } from 'react';
import { X } from 'react-feather';

import { Button } from '@/src/components/ui';
import { breakpoints } from '@/src/styles/tokens.stylex';

interface PhotoViewProps {
  photoName: string;
  /** Opens the photo full size. */
  onSelect?: () => void;
  /** Shows a delete button on hover. */
  onDelete?: () => Promise<unknown>;
  /** Fills its column instead of a fixed width, without the hover zoom. */
  fluid?: boolean;
  /** Lifts the tile, or fades it back while another tile is hovered. */
  emphasis?: 'active' | 'dimmed';
  /** Tints the lifted tile's shadow. */
  glowColor?: string;
  /** Called when a mouse (not a touch) starts hovering the tile. */
  onHoverStart?: () => void;
  /** Called when that mouse leaves the tile. */
  onHoverEnd?: () => void;
}

export function PhotoView({
  photoName,
  onSelect,
  onDelete,
  fluid = false,
  emphasis,
  glowColor,
  onHoverStart,
  onHoverEnd,
}: PhotoViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

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
        fluid && styles.fluid,
        emphasis === 'active' && styles.active,
        emphasis === 'active' && glowColor ? styles.glow(glowColor) : null,
        emphasis === 'dimmed' && styles.dimmed,
        isDeleted && styles.deleted,
      )}
      onPointerEnter={e => {
        setIsHovered(true);
        if (e.pointerType === 'mouse') onHoverStart?.();
      }}
      onPointerLeave={e => {
        setIsHovered(false);
        if (e.pointerType === 'mouse') onHoverEnd?.();
      }}
    >
      <motion.div {...stylex.props(styles.photo)} onTap={onSelect}>
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
    transitionProperty: 'opacity, scale, translate, box-shadow',
    transitionDuration: '500ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  fluid: {
    width: '100%',
    scale: null,
    borderRadius: 12,
  },
  active: {
    scale: 1.02,
    translate: '0 -4px',
  },
  glow: (color: string) => ({
    boxShadow: `0 24px 60px -20px ${color}`,
  }),
  // Opacity only: a filter here would repaint every other tile per hover.
  dimmed: {
    opacity: 0.4,
  },
  deleted: {
    opacity: 0,
  },
  photo: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
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
