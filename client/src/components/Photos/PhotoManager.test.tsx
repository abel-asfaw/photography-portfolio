import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { runBeforeSignOut } from '@/src/api/beforeSignOut';
import type { Photo } from '@/src/api/schemas/photos.schema';

import { UNDO_DELAY_MS } from './manager/useDeferredDelete';
import { PhotoManager } from './PhotoManager';

const { fetchState, reorderState, reorder, deletePhotos, upload, dnd } =
  vi.hoisted(() => ({
    fetchState: {
      data: undefined as Photo[] | undefined,
      isLoading: true,
      isError: false,
    },
    reorderState: { status: 'idle' },
    reorder: vi.fn(),
    deletePhotos: vi.fn(),
    upload: vi.fn(),
    dnd: {
      onDragEnd: undefined as ((event: DropEvent) => void) | undefined,
    },
  }));

vi.mock('@/src/api/services/photos.query', () => ({
  useFetchPhotos: () => fetchState,
  useReorderPhotos: () => ({
    mutate: reorder,
    status: reorderState.status,
    submittedAt: 0,
  }),
  useUploadPhoto: () => ({ mutateAsync: upload }),
  useDeletePhotos: () => ({ mutateAsync: deletePhotos }),
}));

/** The parts of dnd-kit's drag-end event that the editor reads. */
interface DropEvent {
  operation: {
    source: { id: string };
    target: { id: string } | null;
    canceled: boolean;
  };
  canceled: boolean;
}

// Capture the drag handler so tests can simulate a drop without pointer
// events, which jsdom cannot lay out.
vi.mock('@dnd-kit/react', async importOriginal => ({
  ...(await importOriginal<typeof import('@dnd-kit/react')>()),
  DragDropProvider: ({
    onDragEnd,
    children,
  }: {
    onDragEnd: (event: DropEvent) => void;
    children: React.ReactNode;
  }) => {
    dnd.onDragEnd = onDragEnd;
    return children;
  },
  DragOverlay: () => null,
}));

// With no provider there is no drag manager to register with.
vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: () => ({
    ref: () => {},
    handleRef: () => {},
    isDragging: false,
    isDragSource: false,
    isDropping: false,
  }),
}));

const photos: Photo[] = ['1', '2', '3'].map(id => ({
  id,
  name: `${id}.jpg`,
  url: `https://example.com/${id}.jpg`,
}));

/** Drops `sourceId` onto `targetId`'s spot, or outside any spot. */
const drop = (sourceId: string, targetId: string | null) =>
  act(() =>
    dnd.onDragEnd!({
      operation: {
        source: { id: sourceId },
        target: targetId ? { id: targetId } : null,
        canceled: false,
      },
      canceled: false,
    }),
  );

/** The photo names in the order the grid or list shows them. */
const renderedOrder = () =>
  Array.from(document.querySelectorAll('img'), img =>
    img.getAttribute('src')!.split('?')[0].replace(/.*\//, ''),
  );

const tile = (position: number) =>
  screen.getByRole('button', { name: `Photo ${position}` });

const fileInput = () =>
  screen.getByLabelText<HTMLInputElement>('Upload photos');

describe('PhotoManager', () => {
  beforeEach(() => {
    fetchState.data = undefined;
    fetchState.isLoading = true;
    fetchState.isError = false;
    reorderState.status = 'idle';
    reorder.mockReset();
    deletePhotos.mockReset().mockResolvedValue(undefined);
    upload.mockReset().mockResolvedValue(undefined);
    URL.createObjectURL = vi.fn(() => 'blob:preview');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps uploads available while photos load', () => {
    render(<PhotoManager />);

    expect(fileInput()).toBeInTheDocument();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('keeps uploads available when photos fail to load', () => {
    fetchState.isLoading = false;
    fetchState.isError = true;
    render(<PhotoManager />);

    expect(fileInput()).toBeInTheDocument();
    expect(screen.getByText(/failed to load photos/i)).toBeInTheDocument();
  });

  describe('with photos', () => {
    beforeEach(() => {
      fetchState.data = photos;
      fetchState.isLoading = false;
    });

    it('numbers the photos in their saved order', () => {
      render(<PhotoManager />);

      expect(renderedOrder()).toEqual(['1.jpg', '2.jpg', '3.jpg']);
      expect(tile(3)).toHaveTextContent('03');
    });

    it('shows the save status only while the order is changing', () => {
      const { rerender } = render(<PhotoManager />);
      expect(screen.queryByText(/sav/i)).not.toBeInTheDocument();

      reorderState.status = 'pending';
      rerender(<PhotoManager />);
      expect(screen.getByText('Saving…')).toBeInTheDocument();

      reorderState.status = 'success';
      rerender(<PhotoManager />);
      expect(screen.getByText('Saved')).toBeInTheDocument();

      reorderState.status = 'error';
      rerender(<PhotoManager />);
      expect(screen.getByText(/couldn't save the order/i)).toBeInTheDocument();
    });

    it('moves a dropped photo and saves the new order', () => {
      render(<PhotoManager />);

      drop('3', '1');

      expect(renderedOrder()).toEqual(['3.jpg', '1.jpg', '2.jpg']);
      expect(reorder).toHaveBeenCalledWith(['3', '1', '2']);
    });

    it('ignores a drop outside the grid or onto the same photo', () => {
      render(<PhotoManager />);

      drop('2', null);
      drop('2', '2');

      expect(renderedOrder()).toEqual(['1.jpg', '2.jpg', '3.jpg']);
      expect(reorder).not.toHaveBeenCalled();
    });

    it('moves selected photos to the start', async () => {
      render(<PhotoManager />);

      await userEvent.click(tile(3));
      expect(tile(3)).toHaveAttribute('aria-pressed', 'true');
      await userEvent.click(
        screen.getByRole('button', { name: 'Move to start' }),
      );

      expect(renderedOrder()).toEqual(['3.jpg', '1.jpg', '2.jpg']);
      expect(reorder).toHaveBeenCalledWith(['3', '1', '2']);
      expect(screen.queryByRole('toolbar')).not.toBeInTheDocument();
    });

    it('clears the selection with Escape', async () => {
      render(<PhotoManager />);

      await userEvent.click(tile(1));
      await userEvent.keyboard('{Escape}');

      expect(tile(1)).toHaveAttribute('aria-pressed', 'false');
    });

    it('hides deleted photos and brings them back on undo', async () => {
      render(<PhotoManager />);

      await userEvent.click(tile(1));
      await userEvent.click(tile(2));
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));

      expect(renderedOrder()).toEqual(['3.jpg']);
      expect(screen.getByText('2 photos deleted')).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: 'Undo' }));

      expect(renderedOrder()).toEqual(['1.jpg', '2.jpg', '3.jpg']);
      expect(deletePhotos).not.toHaveBeenCalled();
    });

    it('sends a delete once it can no longer be undone', async () => {
      vi.useFakeTimers();
      render(<PhotoManager />);

      fireEvent.click(tile(2));
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      expect(deletePhotos).not.toHaveBeenCalled();

      await act(() => vi.advanceTimersByTimeAsync(UNDO_DELAY_MS));

      expect(deletePhotos).toHaveBeenCalledExactlyOnceWith({
        photoIds: ['2'],
        keepalive: false,
      });
      expect(screen.queryByText('1 photo deleted')).not.toBeInTheDocument();
    });

    it('sends a pending delete when the editor closes', () => {
      const { unmount } = render(<PhotoManager />);

      fireEvent.click(tile(1));
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      unmount();

      expect(deletePhotos).toHaveBeenCalledExactlyOnceWith({
        photoIds: ['1'],
        keepalive: false,
      });
    });

    it('sends a pending delete with keepalive when the page is hidden', () => {
      render(<PhotoManager />);

      fireEvent.click(tile(1));
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      act(() => {
        window.dispatchEvent(new Event('pagehide'));
      });

      expect(deletePhotos).toHaveBeenCalledExactlyOnceWith({
        photoIds: ['1'],
        keepalive: true,
      });
    });

    it('sends a pending delete before signing out', async () => {
      let sent = false;
      deletePhotos.mockImplementation(async () => {
        await Promise.resolve();
        sent = true;
      });
      render(<PhotoManager />);

      fireEvent.click(tile(1));
      fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
      await act(() => runBeforeSignOut());

      expect(deletePhotos).toHaveBeenCalledExactlyOnceWith({
        photoIds: ['1'],
        keepalive: false,
      });
      expect(sent).toBe(true);
    });

    it('keeps a deleted photo in its slot when reordering, for undo', async () => {
      render(<PhotoManager />);

      await userEvent.click(tile(1));
      await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
      drop('3', '2');

      expect(reorder).toHaveBeenLastCalledWith(['1', '3', '2']);
      await userEvent.click(screen.getByRole('button', { name: 'Undo' }));
      expect(renderedOrder()).toEqual(['1.jpg', '3.jpg', '2.jpg']);
    });

    it('uploads valid files and lists invalid ones as errors', async () => {
      render(<PhotoManager />);
      const photo = new File(['x'], 'new.jpg', { type: 'image/jpeg' });
      const notes = new File(['x'], 'notes.txt', { type: 'text/plain' });

      fireEvent.change(fileInput(), { target: { files: [photo, notes] } });

      expect(await screen.findAllByText('Not an image')).not.toHaveLength(0);
      expect(upload).toHaveBeenCalledOnce();
      expect(upload.mock.calls[0][0].file).toBe(photo);
    });

    describe('in Arrange mode', () => {
      const arrange = () =>
        userEvent.click(screen.getAllByRole('button', { name: 'Arrange' })[0]);

      it('saves the new order on Done', async () => {
        render(<PhotoManager />);
        await arrange();

        await userEvent.click(
          screen.getByRole('button', { name: 'Move photo 1 down' }),
        );
        await userEvent.selectOptions(
          screen.getByLabelText('Position of photo 3'),
          '1',
        );
        expect(reorder).not.toHaveBeenCalled();
        await userEvent.click(screen.getByRole('button', { name: 'Done' }));

        expect(reorder).toHaveBeenCalledWith(['3', '2', '1']);
        expect(renderedOrder()).toEqual(['3.jpg', '2.jpg', '1.jpg']);
      });

      it('reorders by dragging a handle', async () => {
        render(<PhotoManager />);
        await arrange();

        drop('1', '3');
        await userEvent.click(screen.getByRole('button', { name: 'Done' }));

        expect(reorder).toHaveBeenCalledWith(['2', '3', '1']);
      });

      it('discards changes on Cancel', async () => {
        render(<PhotoManager />);
        await arrange();

        await userEvent.click(
          screen.getByRole('button', { name: 'Move photo 2 up' }),
        );
        await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        expect(reorder).not.toHaveBeenCalled();
        expect(renderedOrder()).toEqual(['1.jpg', '2.jpg', '3.jpg']);
      });
    });
  });
});
