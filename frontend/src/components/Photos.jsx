import usePhotosContext from '../hooks/usePhotosContext';
import Photo from './Photo';

export default function Photos() {
    const { photos } = usePhotosContext();

    const renderedPhotos = photos.map(({ id, photo_url }) => (
        <Photo key={id} photoId={id} photoUrl={photo_url} loading="lazy" />
    ));

    return (
        <div className="flex flex-wrap items-center justify-center gap-20 p-10 sm:p-20">
            {renderedPhotos}
        </div>
    );
}
