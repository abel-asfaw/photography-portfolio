import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PhotoView } from './PhotoView';

vi.mock('motion/react', () => ({
  motion: {
    div: ({
      onTap,
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { onTap?: () => void }) => (
      <div onClick={onTap} {...props}>
        {children}
      </div>
    ),
  },
}));

const defaultProps = {
  photoName: 'photo.jpg',
};

describe('PhotoView', () => {
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
});
