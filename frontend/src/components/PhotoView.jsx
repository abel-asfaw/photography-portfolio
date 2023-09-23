import { useAuth0 } from '@auth0/auth0-react';
import { MdClose } from 'react-icons/md';
import usePhotosContext from '../hooks/usePhotosContext';

export default function PhotoView({ photoId, photoUrl, ...rest }) {
    const { deletePhotoAndSync } = usePhotosContext();
    const { isAuthenticated } = useAuth0();

    const handleDelete = () => {
        deletePhotoAndSync(photoId);
    };

    return (
        <div className="group relative h-auto w-96">
            <div className="relative transform-gpu overflow-hidden rounded-2xl duration-700 hover:scale-110">
                <img src={photoUrl} className="h-auto w-full" {...rest} />
                {isAuthenticated && (
                    <button
                        onClick={handleDelete}
                        className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full bg-white p-2.5 shadow-xl drop-shadow-xl hover:bg-gray-200 group-hover:flex"
                    >
                        <MdClose />
                    </button>
                )}
            </div>
        </div>
    );
}
