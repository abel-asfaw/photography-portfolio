import { Image } from '@imagekit/react';
import * as stylex from '@stylexjs/stylex';
import { motion } from 'motion/react';

import { breakpoints, radii } from '@/src/styles/tokens.stylex';

interface PhotoViewProps {
  photoName: string;
  /** Opens the photo full size. */
  onSelect?: () => void;
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
  fluid = false,
  emphasis,
  glowColor,
  onHoverStart,
  onHoverEnd,
}: PhotoViewProps) {
  return (
    <div
      {...stylex.props(
        styles.tile,
        fluid && styles.fluid,
        emphasis === 'active' && styles.active,
        emphasis === 'active' && glowColor ? styles.glow(glowColor) : null,
        emphasis === 'dimmed' && styles.dimmed,
      )}
      onPointerEnter={e => {
        if (e.pointerType === 'mouse') onHoverStart?.();
      }}
      onPointerLeave={e => {
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
    borderRadius: radii.xl,
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
  photo: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.xl,
    cursor: 'pointer',
  },
});
