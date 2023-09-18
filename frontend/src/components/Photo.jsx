import usePhotosContext from '../hooks/usePhotosContext';

export default function Photo({ photoId, photoUrl, ...rest }) {
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
                    className="hidden group-hover:block bg-slate-300 absolute top-2 right-2"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
