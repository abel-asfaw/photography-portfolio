import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Photo } from '@/src/api/schemas/photos.schema';

import { orderByIds, useReorderPhotos } from './photos.query';

const { reorderPhotos } = vi.hoisted(() => ({ reorderPhotos: vi.fn() }));

vi.mock('@/src/api/services/photos.api', () => ({ reorderPhotos }));

const photos: Photo[] = ['1', '2', '3'].map(id => ({
  id,
  name: `${id}.jpg`,
  url: `https://example.com/${id}.jpg`,
}));

const ids = (list: Photo[] | undefined) => list?.map(photo => photo.id);

describe('orderByIds', () => {
  it('arranges photos in the given order and drops unknown ids', () => {
    expect(ids(orderByIds(photos, ['3', 'x', '1', '2']))).toEqual([
      '3',
      '1',
      '2',
    ]);
  });
});

describe('useReorderPhotos', () => {
  let queryClient: QueryClient;

  const renderReorder = () =>
    renderHook(() => useReorderPhotos(), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    queryClient.setQueryData(['photos'], photos);
    reorderPhotos.mockReset();
  });

  it('writes the new order to the photos cache', async () => {
    reorderPhotos.mockImplementation(async (photoIds: string[]) =>
      orderByIds(photos, photoIds),
    );
    const { result } = renderReorder();

    act(() => result.current.mutate(['2', '3', '1']));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ids(queryClient.getQueryData<Photo[]>(['photos']))).toEqual([
      '2',
      '3',
      '1',
    ]);
  });

  it('shows the order the server saved', async () => {
    // The server fitted the order to photos added and deleted meanwhile.
    const added = { id: '4', name: '4.jpg', url: 'https://example.com/4.jpg' };
    reorderPhotos.mockResolvedValue([photos[2], photos[1], added]);
    const { result } = renderReorder();

    act(() => result.current.mutate(['3', '1', '2']));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reorderPhotos).toHaveBeenCalledWith(['3', '1', '2']);
    expect(ids(queryClient.getQueryData<Photo[]>(['photos']))).toEqual([
      '3',
      '2',
      '4',
    ]);
  });

  it('restores the previous order when saving fails', async () => {
    reorderPhotos.mockRejectedValue(new Error('500'));
    const { result } = renderReorder();

    act(() => result.current.mutate(['2', '3', '1']));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(ids(queryClient.getQueryData<Photo[]>(['photos']))).toEqual([
      '1',
      '2',
      '3',
    ]);
  });
});
