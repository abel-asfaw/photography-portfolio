import { Image } from '@imagekit/react';
import * as stylex from '@stylexjs/stylex';

interface ThumbnailProps {
  photoName: string;
  /** The square's side in image pixels; about twice the displayed size. */
  size?: number;
  xstyle?: stylex.StyleXStyles;
}

/**
 * A square, center-cropped thumbnail for the admin editor. It can't be
 * dragged natively or long-pressed for the iOS preview, either of which
 * would steal the gesture from reordering.
 */
export function Thumbnail({ photoName, size = 360, xstyle }: ThumbnailProps) {
  return (
    <Image
      urlEndpoint={import.meta.env.VITE_IMAGE_KIT_URL}
      src={`/${photoName}`}
      transformation={[{ width: size, height: size, focus: 'auto' }]}
      responsive={false}
      alt=""
      draggable={false}
      {...stylex.props(styles.image, xstyle)}
    />
  );
}

const styles = stylex.create({
  image: {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
  },
});
