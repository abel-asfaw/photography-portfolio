import usePhotosContext from '../hooks/usePhotosContext';
import PhotoView from './PhotoView';

export default function PhotoList() {
    const { photos } = usePhotosContext();

    const renderedPhotos = photos.map(({ id, photo_url }) => (
        <PhotoView key={id} photoId={id} photoUrl={photo_url} />
    ));

    return (
        <div className="flex flex-wrap items-center justify-center gap-20 p-10 sm:p-20">
            {renderedPhotos}
        </div>
    );
}
