import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement, type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Photo } from '@/src/api/schemas/photos.schema';

import { PhotoList } from './PhotoList';

const { fetchState } = vi.hoisted(() => ({
  fetchState: {
    data: undefined as Photo[] | undefined,
    isLoading: true,
    isError: false,
  },
}));

// Render Motion elements as plain tags, with taps as clicks and no exit
// animations.
vi.mock('motion/react', () => {
  const motionProps = [
    'custom',
    'variants',
    'initial',
    'animate',
    'exit',
    'transition',
    'onPanEnd',
  ];
  const element =
    (tag: string) =>
    ({ onTap, ...props }: Record<string, unknown> & { onTap?: () => void }) =>
      createElement(tag, {
        onClick: onTap,
        ...Object.fromEntries(
          Object.entries(props).filter(([key]) => !motionProps.includes(key)),
        ),
      });
  return {
    motion: {
      div: element('div'),
      button: element('button'),
      nav: element('nav'),
    },
    AnimatePresence: ({ children }: { children: ReactNode }) => children,
    useIsPresent: () => true,
  };
});

vi.mock('@/src/api/services/photos.query', () => ({
  useFetchPhotos: () => fetchState,
}));

const photos: Photo[] = [
  { id: '1', name: 'one.jpg', url: 'https://example.com/one.jpg' },
  { id: '2', name: 'two.jpg', url: 'https://example.com/two.jpg' },
];

describe('PhotoList', () => {
  beforeEach(() => {
    fetchState.data = undefined;
    fetchState.isLoading = true;
    fetchState.isError = false;
  });

  it('shows a loading message until photos arrive', () => {
    render(<PhotoList />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows an error message when photos fail to load', () => {
    fetchState.isLoading = false;
    fetchState.isError = true;
    render(<PhotoList />);

    expect(screen.getByText(/failed to load photos/i)).toBeInTheDocument();
  });

  it('shows the empty message when there are no photos', () => {
    fetchState.data = [];
    fetchState.isLoading = false;
    render(<PhotoList />);

    expect(screen.getByText('No photos to display…')).toBeInTheDocument();
  });

  it('renders the gallery read-only', () => {
    fetchState.data = photos;
    fetchState.isLoading = false;
    render(<PhotoList />);

    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.queryByLabelText('Upload photo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('closes the viewer when a refetch drops the open photo', async () => {
    fetchState.data = photos;
    fetchState.isLoading = false;
    const { rerender } = render(<PhotoList />);

    await userEvent.click(screen.getAllByRole('img')[1]);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Photo 2 of 2');

    fetchState.data = [photos[0]];
    rerender(<PhotoList />);

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('lets go of the hovered tile once the mouse leaves it', () => {
    fetchState.data = photos;
    fetchState.isLoading = false;
    render(<PhotoList />);

    // The tile is the image's grandparent: tile > motion wrapper > img.
    const [first, second] = screen
      .getAllByRole('img')
      .map(img => img.parentElement!.parentElement!);
    const resting = second.className;

    fireEvent.pointerEnter(first, { pointerType: 'mouse' });
    expect(second.className).not.toBe(resting);

    fireEvent.pointerLeave(first, { pointerType: 'mouse' });
    expect(second.className).toBe(resting);
  });
});
