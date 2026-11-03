import * as stylex from '@stylexjs/stylex';
import { PropsWithChildren } from 'react';

import { Photo } from '@/src/api/schemas/photos.schema';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

interface PhotoGridProps extends PropsWithChildren {
  photos: Photo[] | undefined;
  isLoading: boolean;
  isError: boolean;
  stretch?: boolean;
}

const statusMessage = ({
  photos,
  isLoading,
  isError,
}: Omit<PhotoGridProps, 'stretch' | 'children'>) => {
  if (photos) return photos.length > 0 ? null : 'No photos to display...';
  if (isLoading) return 'Loading...';
  if (isError) return 'Failed to load photos. Please try again.';
  return '';
};

/**
 * Lays out photo tiles, showing a loading, error or empty message in place
 * of `children` until there are photos to render.
 */
export function PhotoGrid({
  stretch = false,
  children,
  ...status
}: PhotoGridProps) {
  return (
    <div {...stylex.props(styles.grid, stretch && styles.stretch)}>
      {statusMessage(status) ?? children}
    </div>
  );
}

const styles = stylex.create({
  grid: {
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: { default: '3rem', [breakpoints.sm]: '4rem' },
    paddingInline: { default: '2.5rem', [breakpoints.sm]: '5rem' },
    paddingTop: { default: '2.5rem', [breakpoints.sm]: '5rem' },
    paddingBottom: { default: '0.5rem', [breakpoints.sm]: '3rem' },
    color: colors.textLight,
  },
  stretch: {
    alignItems: 'stretch',
  },
});
