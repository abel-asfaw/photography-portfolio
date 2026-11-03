import * as stylex from '@stylexjs/stylex';
import { AnimatePresence } from 'motion/react';
import { useEffect, useRef, useState } from 'react';

import { useFetchPhotos } from '@/src/api/services/photos.query';

import { AmbientGlow } from './AmbientGlow';
import { Masonry } from './Masonry';
import { preloadPhotoColors, usePhotoColor } from './photoColor';
import { PhotoGrid } from './PhotoGrid';
import { PhotoOverlay } from './PhotoOverlay';
import { PhotoView } from './PhotoView';

/**
 * The public, read-only gallery. Hovering a photo tints the page with its
 * color; tapping one opens the viewer, which steps through the rest while
 * the gallery recedes behind it.
 */
export function PhotoList() {
  const { data: photos, isLoading, isError } = useFetchPhotos();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Tracked by id, not index, so a refetch that reorders or drops photos
  // keeps the viewer on the same photo, or closes it if that one is gone.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The gallery shrinks toward the middle of the screen, wherever it is
  // scrolled, so the visible tiles recede in place.
  const gallery = useRef<HTMLDivElement>(null);
  const [recedeOrigin, setRecedeOrigin] = useState('50% 0px');

  useEffect(() => {
    if (photos) preloadPhotoColors(photos.map(p => p.name));
  }, [photos]);

  const selectedIndex = photos?.findIndex(p => p.id === selectedId) ?? -1;
  const selectedPhoto = photos?.[selectedIndex];
  const hoveredPhoto = selectedPhoto
    ? undefined
    : photos?.find(p => p.id === hoveredId);
  const hoverColor = usePhotoColor(hoveredPhoto?.name);

  const open = (id: string) => {
    setHoveredId(null);
    const top = gallery.current?.getBoundingClientRect().top ?? 0;
    setRecedeOrigin(`50% ${window.innerHeight * 0.4 - top}px`);
    setSelectedId(id);
  };

  return (
    <>
      <AmbientGlow color={hoverColor} />
      <PhotoGrid
        photos={photos}
        isLoading={isLoading}
        isError={isError}
        masonry
      >
        <div
          ref={gallery}
          {...stylex.props(
            styles.gallery,
            styles.origin(recedeOrigin),
            selectedPhoto && styles.receded,
          )}
        >
          <Masonry>
            {photos?.map(photo => (
              <PhotoView
                key={photo.id}
                photoName={photo.name}
                fluid
                emphasis={
                  hoveredPhoto
                    ? hoveredPhoto.id === photo.id
                      ? 'active'
                      : 'dimmed'
                    : undefined
                }
                glowColor={hoverColor}
                onHoverStart={() => setHoveredId(photo.id)}
                // Only if still this tile, in case the next one's enter won.
                onHoverEnd={() =>
                  setHoveredId(id => (id === photo.id ? null : id))
                }
                onSelect={() => open(photo.id)}
              />
            ))}
          </Masonry>
        </div>
      </PhotoGrid>
      <AnimatePresence>
        {photos && selectedPhoto && (
          <PhotoOverlay
            photos={photos}
            index={selectedIndex}
            onNavigate={index => setSelectedId(photos[index].id)}
            onClose={() => setSelectedId(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

const styles = stylex.create({
  gallery: {
    width: '100%',
    // Transform and opacity only, so the recede stays on the compositor.
    transitionProperty: 'scale, opacity',
    transitionDuration: '700ms',
    transitionTimingFunction: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
  },
  origin: (transformOrigin: string) => ({ transformOrigin }),
  receded: {
    scale: 0.94,
    opacity: 0.45,
  },
});
