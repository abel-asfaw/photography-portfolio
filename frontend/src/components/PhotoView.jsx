import usePhotosContext from '../hooks/usePhotosContext';

export default function PhotoView({ photoId, photoUrl, ...rest }) {
    const { deletePhotoAndSync } = usePhotosContext();

    const handleDelete = () => {
        deletePhotoAndSync(photoId);
    };

    return (
        <div className="group relative h-auto w-96">
            <div className="relative transform-gpu overflow-hidden rounded-2xl duration-700 hover:scale-110">
                <img src={photoUrl} className="h-auto w-full" {...rest} />
                <button
                    onClick={handleDelete}
                    className="absolute right-2 top-2 hidden h-8 w-8 items-center justify-center rounded-full bg-white p-2.5 shadow-xl drop-shadow-xl hover:bg-gray-200 group-hover:flex"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                        <path
                            d="M21.5 4.5H26.5V43.5H21.5Z"
                            transform="rotate(45 24 24)"
                        />
                        <path
                            d="M21.5 4.5H26.5V43.5H21.5Z"
                            transform="rotate(135 24 24)"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
