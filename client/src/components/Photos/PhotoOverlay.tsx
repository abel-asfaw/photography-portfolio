import { Image } from '@imagekit/react';
import * as stylex from '@stylexjs/stylex';
import {
  AnimatePresence,
  motion,
  useIsPresent,
  type Variants,
} from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { X } from 'react-feather';

import { Photo } from '@/src/api/schemas/photos.schema';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

import { AmbientGlow } from './AmbientGlow';
import { usePhotoColor } from './photoColor';

interface PhotoOverlayProps {
  photos: Photo[];
  index: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

const SWIPE_DISTANCE = 50;

const pad = (n: number) => String(n).padStart(2, '0');

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const ease = [0.2, 0.8, 0.2, 1] as const;

// Keyed by direction: 0 rises into place on open and sinks back on close;
// 1 or -1 slides in from the side being stepped towards.
const photoMotion: Variants = {
  enter: (direction: number) =>
    direction === 0
      ? { opacity: 0, x: 0, y: 32, scale: 0.96 }
      : { opacity: 0, x: direction * 80, y: 0, scale: 1 },
  center: (direction: number) => ({
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition:
      direction === 0
        ? { duration: 0.7, ease, delay: 0.08 }
        : { duration: 0.45, ease, opacity: { duration: 0.3 } },
  }),
  exit: (direction: number) =>
    direction === 0
      ? { opacity: 0, y: 32, scale: 0.96, transition: { duration: 0.35 } }
      : {
          opacity: 0,
          x: direction * -80,
          transition: { duration: 0.45, ease, opacity: { duration: 0.3 } },
        },
};

export function PhotoOverlay({
  photos,
  index,
  onNavigate,
  onClose,
}: PhotoOverlayProps) {
  const photo = photos[index];
  const color = usePhotoColor(photo.name);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  // False while the exit animation plays. Navigating then would select a
  // photo again and reopen the viewer as it fades out.
  const isPresent = useIsPresent();
  // Each step gets its own key rather than the photo's id, so stepping back
  // to a photo still sliding out never makes AnimatePresence hold two
  // children with one key (which can leave the exit, and so the close,
  // stuck).
  const [move, setMove] = useState({ direction: 0, count: 0 });

  const navigate = (i: number, towards = Math.sign(i - index)) => {
    if (!isPresent) return;
    setMove(m => ({ direction: towards, count: m.count + 1 }));
    onNavigate(i);
  };
  const step = (delta: number) =>
    navigate((index + delta + photos.length) % photos.length, delta);

  // Open as a modal, so focus moves in and the page behind is inert, and
  // stop the page scrolling under it. jsdom has no showModal.
  useLayoutEffect(() => {
    const el = dialog.current;
    const previousFocus = document.activeElement;
    if (el && !el.open) {
      if (el.showModal) el.showModal();
      else el.setAttribute('open', '');
    }
    closeButton.current?.focus();
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = previousOverflow;
      el?.close?.();
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, []);

  // Escape arrives as the dialog's cancel event instead (see onCancel).
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') stepRef.current(-1);
      if (e.key === 'ArrowRight') stepRef.current(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    // Not in jsdom, hence the optional call.
    thumbnails.current[index]?.scrollIntoView?.({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [index]);

  return (
    <dialog
      ref={dialog}
      aria-label={`Photo ${index + 1} of ${photos.length}`}
      onCancel={e => {
        // Close through the parent, so the exit animation runs.
        e.preventDefault();
        if (isPresent) onClose();
      }}
      {...stylex.props(styles.overlay)}
    >
      {/* Motion makes tap targets focusable; the backdrop shouldn't take
          the dialog's first focus, and keyboards have Escape and Close. */}
      <motion.div
        {...stylex.props(styles.backdrop)}
        {...fade}
        tabIndex={-1}
        onTap={onClose}
      >
        <AmbientGlow color={color} contained />
      </motion.div>
      <motion.div {...stylex.props(styles.topBar)} {...fade}>
        <span {...stylex.props(styles.counter)}>
          {pad(index + 1)} / {pad(photos.length)}
        </span>
        <button
          type="button"
          ref={closeButton}
          aria-label="Close"
          onClick={onClose}
          {...stylex.props(styles.close)}
        >
          <X size={24} strokeWidth={1.75} />
        </button>
      </motion.div>
      <motion.div
        {...stylex.props(styles.stage)}
        onPanEnd={(_, info) => {
          if (info.offset.x <= -SWIPE_DISTANCE) step(1);
          else if (info.offset.x >= SWIPE_DISTANCE) step(-1);
        }}
      >
        {/* One grid cell, so the leaving and arriving photos overlap. */}
        <div {...stylex.props(styles.frame)}>
          {/* `propagate` sinks the photo when the whole viewer closes. Stop
              rendering it then: Motion (12.43–14.9) otherwise mounts a
              duplicate that fades in. */}
          <AnimatePresence propagate custom={isPresent ? move.direction : 0}>
            {isPresent && (
              <motion.div
                key={move.count}
                custom={move.direction}
                variants={photoMotion}
                initial="enter"
                animate="center"
                exit="exit"
                {...stylex.props(styles.photo)}
                style={{
                  boxShadow: color ? `0 40px 120px -30px ${color}` : undefined,
                }}
              >
                {/* Same props as the grid tile so the browser reuses the
                    cached image, and auto sizing so the box always matches
                    its shape. */}
                <Image
                  urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
                  src={`/${photo.name}`}
                  loading="eager"
                  height={600}
                  width={600}
                  sizes="600px"
                  alt=""
                  {...stylex.props(styles.image)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Taps rather than clicks, so a swipe that ends on a zone doesn't
            also step. Out of the tab order: keyboards have the arrow keys,
            and focusing a zone would ring half the photo. */}
        <motion.button
          type="button"
          aria-label="Previous photo"
          tabIndex={-1}
          onTap={() => step(-1)}
          {...stylex.props(styles.zone, styles.previous)}
        />
        <motion.button
          type="button"
          aria-label="Next photo"
          tabIndex={-1}
          onTap={() => step(1)}
          {...stylex.props(styles.zone, styles.next)}
        />
      </motion.div>
      <motion.nav
        aria-label="All photos"
        {...stylex.props(styles.strip)}
        {...fade}
      >
        {photos.map((p, i) => (
          <button
            key={p.id}
            ref={el => {
              thumbnails.current[i] = el;
            }}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            aria-current={i === index}
            onClick={() => navigate(i)}
            {...stylex.props(
              styles.thumbnail,
              i === index && styles.currentThumbnail,
            )}
          >
            <Image
              urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
              src={`/${p.name}`}
              height={120}
              width={120}
              sizes="120px"
              alt=""
              {...stylex.props(styles.thumbnailImage)}
            />
          </button>
        ))}
      </motion.nav>
    </dialog>
  );
}

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    inset: 0,
    // Undo the default <dialog> box.
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    color: 'inherit',
    zIndex: 50,
    display: 'flex',
    flexDirection: 'column',
    // Swipes step through photos instead of scrolling or zooming the page.
    touchAction: 'none',
  },
  backdrop: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    backgroundColor: 'rgb(8 8 9 / 0.92)',
    backdropFilter: 'blur(14px)',
  },
  // The top bar and stage cover the backdrop, so they let taps on their
  // empty space through to it (to close); their controls opt back in.
  topBar: {
    position: 'relative',
    pointerEvents: 'none',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBlock: '0.75rem',
    paddingInlineStart: { default: '1rem', [breakpoints.sm]: '3rem' },
    paddingInlineEnd: { default: '0.5rem', [breakpoints.sm]: '2rem' },
  },
  counter: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: '0.8125rem',
    color: colors.textSubtle,
    fontVariantNumeric: 'tabular-nums',
  },
  close: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.75rem',
    height: '2.75rem',
    pointerEvents: 'auto',
    cursor: 'pointer',
    color: { default: colors.textLight, ':hover': colors.white },
  },
  stage: {
    position: 'relative',
    pointerEvents: 'none',
    flexGrow: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingInline: { default: '0.75rem', [breakpoints.sm]: '3rem' },
  },
  frame: {
    display: 'grid',
    placeItems: 'center',
  },
  photo: {
    gridArea: '1 / 1',
    position: 'relative',
    pointerEvents: 'auto',
    overflow: 'hidden',
    borderRadius: 12,
  },
  image: {
    width: 'auto',
    height: 'auto',
    maxWidth: {
      default: 'calc(100vw - 1.5rem)',
      [breakpoints.sm]: 'calc(100vw - 6rem)',
    },
    // Leaves room for the top bar and the thumbnail strip.
    maxHeight: 'calc(100dvh - 11rem)',
  },
  zone: {
    position: 'absolute',
    pointerEvents: 'auto',
    outline: 'none',
    top: 0,
    bottom: 0,
    width: '35%',
  },
  previous: {
    left: 0,
    cursor: 'w-resize',
  },
  next: {
    right: 0,
    cursor: 'e-resize',
  },
  strip: {
    position: 'relative',
    display: 'flex',
    gap: '0.5rem',
    overflowX: 'auto',
    scrollbarWidth: 'none',
    paddingTop: '1.25rem',
    paddingBottom: '1.75rem',
    paddingInline: '1rem',
    // Centered when it fits; `safe` keeps the start reachable when it scrolls.
    justifyContent: 'safe center',
  },
  thumbnail: {
    flexShrink: 0,
    width: { default: '1.75rem', [breakpoints.sm]: '2.5rem' },
    height: { default: '2.75rem', [breakpoints.sm]: '3.5rem' },
    borderRadius: 6,
    overflow: 'hidden',
    cursor: 'pointer',
    opacity: { default: 0.4, ':hover': 0.75 },
    transitionProperty: 'width, opacity',
    transitionDuration: '350ms',
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  currentThumbnail: {
    width: { default: '3.5rem', [breakpoints.sm]: '5.25rem' },
    opacity: 1,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
});
