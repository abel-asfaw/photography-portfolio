import { render, screen } from '@testing-library/react';
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

    expect(screen.getByText('Loading...')).toBeInTheDocument();
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

    expect(screen.getByText('No photos to display...')).toBeInTheDocument();
  });

  it('renders the gallery read-only', () => {
    fetchState.data = photos;
    fetchState.isLoading = false;
    render(<PhotoList />);

    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.queryByLabelText('Upload photo')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
