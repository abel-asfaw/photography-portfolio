import * as stylex from '@stylexjs/stylex';
import { PropsWithChildren } from 'react';

import { Photo } from '@/src/api/schemas/photos.schema';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

import { statusMessage } from './statusMessage';

interface PhotoGridProps extends PropsWithChildren {
  photos: Photo[] | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Tighter padding for a full-width masonry layout. */
  masonry?: boolean;
}

/**
 * Lays out photo tiles, showing a loading, error or empty message in place
 * of `children` until there are photos to render.
 */
export function PhotoGrid({
  masonry = false,
  children,
  ...status
}: PhotoGridProps) {
  return (
    <div {...stylex.props(styles.grid, masonry && styles.masonry)}>
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
  masonry: {
    alignItems: 'flex-start',
    paddingInline: { default: '0.75rem', [breakpoints.sm]: '3rem' },
    paddingTop: { default: '0.5rem', [breakpoints.sm]: '1rem' },
  },
});
