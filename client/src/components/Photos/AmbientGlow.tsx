import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';

interface AmbientGlowProps {
  /** The glow color; the glow fades out while this is undefined. */
  color: string | undefined;
  /** Positions the glow absolutely within its parent instead of the page. */
  contained?: boolean;
}

/** A soft wash of a photo's color behind the content. */
export function AmbientGlow({ color, contained = false }: AmbientGlowProps) {
  // Keep painting the last color while fading out, so the glow doesn't
  // flash to transparent black.
  const [lastColor, setLastColor] = useState(color);
  if (color && color !== lastColor) setLastColor(color);

  return (
    <div
      aria-hidden
      {...stylex.props(
        styles.glow,
        contained && styles.contained,
        color ? styles.visible : styles.hidden,
        Boolean(color) && contained && styles.strong,
        lastColor ? styles.color(lastColor) : null,
      )}
    />
  );
}

const styles = stylex.create({
  glow: {
    position: 'fixed',
    inset: 0,
    zIndex: -1,
    pointerEvents: 'none',
    maskImage:
      'radial-gradient(ellipse 70% 60% at 50% 40%, #000 0%, transparent 78%)',
    transitionProperty: 'background-color, opacity',
    transitionDuration: '700ms',
    transitionTimingFunction: 'ease',
  },
  contained: {
    position: 'absolute',
    zIndex: 0,
  },
  visible: {
    opacity: 0.32,
  },
  // Inside the viewer the glow sits on a near-opaque backdrop.
  strong: {
    opacity: 0.5,
  },
  hidden: {
    opacity: 0,
  },
  color: (color: string) => ({
    backgroundColor: color,
  }),
});
