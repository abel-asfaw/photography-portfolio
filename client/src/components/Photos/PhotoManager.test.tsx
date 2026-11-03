import type { DragEndEvent } from '@dnd-kit/core';
import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Photo } from '@/src/api/schemas/photos.schema';

import { PhotoManager } from './PhotoManager';

const { fetchState, reorder, dnd } = vi.hoisted(() => ({
  fetchState: {
    data: undefined as Photo[] | undefined,
    isLoading: true,
    isError: false,
  },
  reorder: vi.fn(),
  dnd: { onDragEnd: undefined as ((event: DragEndEvent) => void) | undefined },
}));

vi.mock('@/src/api/services/photos.query', () => ({
  useFetchPhotos: () => fetchState,
  useReorderPhotos: () => ({ mutate: reorder }),
  useUploadPhotos: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useDeletePhoto: () => ({ mutateAsync: vi.fn() }),
}));

// Capture the drag handler so tests can simulate a drop without pointer
// events, which jsdom cannot lay out.
vi.mock('@dnd-kit/core', async importOriginal => ({
  ...(await importOriginal<typeof import('@dnd-kit/core')>()),
  DndContext: ({
    onDragEnd,
    children,
  }: {
    onDragEnd: (event: DragEndEvent) => void;
    children: React.ReactNode;
  }) => {
    dnd.onDragEnd = onDragEnd;
    return children;
  },
}));

const photos: Photo[] = ['1', '2', '3'].map(id => ({
  id,
  name: `${id}.jpg`,
  url: `https://example.com/${id}.jpg`,
}));

const rect = { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };

const drop = (activeId: string, overId: string | null) =>
  act(() =>
    dnd.onDragEnd!({
      active: {
        id: activeId,
        data: { current: undefined },
        rect: { current: { initial: null, translated: null } },
      },
      over: overId
        ? { id: overId, rect, disabled: false, data: { current: undefined } }
        : null,
      collisions: null,
      delta: { x: 0, y: 0 },
      activatorEvent: new Event('pointerdown'),
    }),
  );

const renderedOrder = () =>
  screen.getAllByRole('img').map(img => img.getAttribute('src'));

describe('PhotoManager', () => {
  beforeEach(() => {
    fetchState.data = undefined;
    fetchState.isLoading = true;
    fetchState.isError = false;
    reorder.mockReset();
  });

  it('keeps the uploader available while photos load', () => {
    render(<PhotoManager />);

    expect(screen.getByLabelText('Upload photo')).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('keeps the uploader available when photos fail to load', () => {
    fetchState.isLoading = false;
    fetchState.isError = true;
    render(<PhotoManager />);

    expect(screen.getByLabelText('Upload photo')).toBeInTheDocument();
    expect(screen.getByText(/failed to load photos/i)).toBeInTheDocument();
  });

  describe('with photos', () => {
    beforeEach(() => {
      fetchState.data = photos;
      fetchState.isLoading = false;
    });

    it('moves a dropped photo and saves the new order', () => {
      render(<PhotoManager />);

      drop('3', '1');

      expect(renderedOrder()).toEqual(['/3.jpg', '/1.jpg', '/2.jpg']);
      expect(reorder).toHaveBeenCalledWith(['3', '1', '2']);
    });

    it('ignores a drop outside the list or onto the same photo', () => {
      render(<PhotoManager />);

      drop('2', null);
      drop('2', '2');

      expect(renderedOrder()).toEqual(['/1.jpg', '/2.jpg', '/3.jpg']);
      expect(reorder).not.toHaveBeenCalled();
    });
  });
});
