import { useEffect } from 'react';
import Photo from './Photo';

export default function Photos({ photos, onUpdatePhotos }) {
    useEffect(() => {
        const localData = localStorage.getItem('photos');
        if (localData) {
            onUpdatePhotos(JSON.parse(localData));
        } else {
            fetchPhotos();
        }
    }, []);

    const fetchPhotos = async () => {
        const response = await fetch(
            import.meta.env.VITE_API_BASE_URL + '/photos',
        );

        if (response.ok) {
            const data = await response.json();
            onUpdatePhotos(data);
            localStorage.setItem('photos', JSON.stringify(data));
        }
    };

    const renderedPhotos = photos.map(({ id, photo_name, photo_url }) => (
        <Photo key={id} id={photo_name} imageSrc={photo_url} loading="lazy" />
    ));

    return (
        <div className="flex flex-wrap items-center justify-center gap-20 p-10 sm:p-20">
            {renderedPhotos}
        </div>
    );
}
