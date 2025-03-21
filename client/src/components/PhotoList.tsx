import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';

import { fetchPhotos } from '@/src/api/PhotosAPI';
import PhotoView from '@/src/components/PhotoView';
import { usePhotosStore } from '@/src/store/photosStore';

interface PhotoListProps {
    isAuthenticated?: boolean;
}

export default function PhotoList({ isAuthenticated = false }: PhotoListProps) {
    const photos = usePhotosStore(state => state.photos);
    const setPhotos = usePhotosStore(state => state.setPhotos);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['photos'],
        queryFn: fetchPhotos,
        staleTime: 1000 * 60 * 60,
    });

    useEffect(() => {
        if (!isLoading && !isError && data) {
            setPhotos(data);
        }
    }, [data, isLoading, isError]);

    const renderedPhotos = photos?.map(({ id, url }) => (
        <PhotoView
            key={id}
            photoId={id}
            photoUrl={url}
            canDelete={isAuthenticated}
        />
    ));

    return (
        <div className="flex flex-wrap items-center justify-center gap-20 p-10 text-white sm:p-20">
            {isLoading
                ? 'Loading...'
                : isError
                ? 'Failed to load photos. Please try again.'
                : renderedPhotos?.length
                ? renderedPhotos
                : 'No photos to display...'}
        </div>
    );
}
