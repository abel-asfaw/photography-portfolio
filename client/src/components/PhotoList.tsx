import PhotoView from '@/src/components/PhotoView';
import { usePhotosStore } from '@/src/store/photosStore';

interface PhotoListProps {
    isAuthenticated?: boolean;
}

export default function PhotoList({ isAuthenticated = false }: PhotoListProps) {
    const photos = usePhotosStore(state => state.photos);

    const renderedPhotos = photos.map(({ id, url }) => (
        <PhotoView
            key={id}
            photoId={id}
            photoUrl={url}
            canDelete={isAuthenticated}
        />
    ));

    return (
        <div className="flex flex-wrap items-center justify-center gap-20 p-10 text-white sm:p-20">
            {renderedPhotos.length ? renderedPhotos : 'No photos to display...'}
        </div>
    );
}
