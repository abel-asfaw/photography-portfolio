import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PhotoView } from './PhotoView';

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      onTap,
      children,
      layoutId: _l,
      whileHover: _w,
      onLayoutAnimationComplete: _c,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & {
      onTap?: () => void;
      layoutId?: string;
      whileHover?: object;
      onLayoutAnimationComplete?: () => void;
    }) => (
      <div onClick={onTap} {...props}>
        {children}
      </div>
    ),
  },
}));

const defaultProps = {
  photoId: '1234',
  photoName: 'photo.jpg',
};

// The hover/fade wrapper is the photo's grandparent (img → motion.div →
// tile). StyleX class names are generated, so the delete tests compare the
// tile's class list before and after rather than asserting a name.
const tile = () => screen.getByRole('img').parentElement!.parentElement!;

describe('PhotoView', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the photo image', () => {
    render(<PhotoView {...defaultProps} />);

    expect(screen.getByRole('img')).toHaveAttribute('src', '/photo.jpg');
  });

  it('calls onSelect when the photo is clicked', async () => {
    const onSelect = vi.fn();
    render(<PhotoView {...defaultProps} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('img'));

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it('shows a delete button on hover when onDelete is given', async () => {
    render(<PhotoView {...defaultProps} onDelete={vi.fn()} />);

    await userEvent.hover(screen.getByRole('img'));

    expect(
      screen.getByRole('button', { name: 'Delete photo' }),
    ).toBeInTheDocument();
  });

  it('has no delete button without onDelete', async () => {
    render(<PhotoView {...defaultProps} />);

    await userEvent.hover(screen.getByRole('img'));

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('fades out and deletes when the delete button is clicked', async () => {
    vi.useFakeTimers();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<PhotoView {...defaultProps} onDelete={onDelete} />);

    fireEvent.mouseEnter(tile());
    const visibleClasses = tile().className;
    fireEvent.click(screen.getByRole('button', { name: 'Delete photo' }));
    expect(tile().className).not.toBe(visibleClasses);

    await act(() => vi.advanceTimersByTimeAsync(200));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(tile().className).not.toBe(visibleClasses);
  });

  it('brings the photo back when the delete fails', async () => {
    vi.useFakeTimers();
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const onDelete = vi.fn().mockRejectedValue(new Error('403'));
    render(<PhotoView {...defaultProps} onDelete={onDelete} />);

    fireEvent.mouseEnter(tile());
    const visibleClasses = tile().className;
    fireEvent.click(screen.getByRole('button', { name: 'Delete photo' }));
    await act(() => vi.advanceTimersByTimeAsync(200));

    expect(onDelete).toHaveBeenCalledOnce();
    expect(tile().className).toBe(visibleClasses);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
