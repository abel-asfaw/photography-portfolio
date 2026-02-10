import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PhotoView } from './PhotoView';

const deletePhoto = vi.fn();

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      onTap,
      children,
      layoutId: _l,
      whileHover: _w,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      onTap?: () => void;
      layoutId?: string;
      whileHover?: object;
    }) => (
      <div onClick={onTap} {...props}>
        {children}
      </div>
    ),
  },
}));

vi.mock('@imagekit/react', () => ({
  Image: ({
    urlEndpoint: _u,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { urlEndpoint?: string }) => (
    <img {...props} />
  ),
}));

vi.mock('@/src/api/services/photos.query', () => ({
  useDeletePhoto: () => ({ mutateAsync: deletePhoto }),
}));

const defaultProps = {
  photoId: '1234',
  photoName: 'photo.jpg',
  canDelete: false,
  onSelect: vi.fn(),
};

describe('PhotoView', () => {
  it('renders the photo image', () => {
    render(<PhotoView {...defaultProps} />);

    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('calls onSelect when the photo is clicked', async () => {
    const onSelect = vi.fn();
    render(<PhotoView {...defaultProps} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('img'));

    expect(onSelect).toHaveBeenCalledWith('1234', 'photo.jpg');
  });

  it('shows delete button on hover when canDelete is true', async () => {
    render(<PhotoView {...defaultProps} canDelete={true} />);

    await userEvent.hover(screen.getByRole('img'));

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('does not show delete button on hover when canDelete is false', async () => {
    render(<PhotoView {...defaultProps} />);

    await userEvent.hover(screen.getByRole('img'));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls deletePhoto when the delete button is clicked', () => {
    vi.useFakeTimers();
    render(<PhotoView {...defaultProps} canDelete={true} />);

    fireEvent.mouseEnter(screen.getByRole('img').closest('div')!);
    fireEvent.click(screen.getByRole('button'));
    vi.advanceTimersByTime(200);

    expect(deletePhoto).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
