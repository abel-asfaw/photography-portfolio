import { MdClose } from 'react-icons/md';
import Button from './Button';
import usePhotosContext from '../hooks/usePhotosContext';

export default function PhotoView({ photoId, photoUrl, canDelete }) {
    const { deletePhotoAndSync } = usePhotosContext();

    const handleDelete = () => {
        deletePhotoAndSync(photoId);
    };

    return (
        <div className="group relative h-auto w-96">
            <div className="relative transform-gpu overflow-hidden rounded-2xl duration-700 hover:scale-110">
                <img src={photoUrl} className="h-auto w-full" loading="lazy" />
                {canDelete && (
                    <Button
                        primary
                        circular
                        onClick={handleDelete}
                        className="absolute right-2 top-2 text-red-600 opacity-0 shadow-sm shadow-zinc-700 group-hover:opacity-100"
                    >
                        <MdClose size={12} />
                    </Button>
                )}
            </div>
        </div>
    );
}
