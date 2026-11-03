import classNames from 'classnames';
import { PropsWithChildren } from 'react';

import { Photo } from '@/src/api/schemas/photos.schema';

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
  const classes = classNames(
    'flex grow flex-wrap justify-center gap-12 px-10 pt-10 pb-2 text-neutral-200 sm:gap-16 sm:px-20 sm:pt-20 sm:pb-12',
    stretch ? 'items-stretch' : 'items-center',
  );

  return <div className={classes}>{statusMessage(status) ?? children}</div>;
}
