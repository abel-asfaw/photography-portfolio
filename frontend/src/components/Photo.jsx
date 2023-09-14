import usePhotosContext from '../hooks/usePhotosContext';

export default function Photo({ photo, ...rest }) {
    const { deletePhotoAndSync } = usePhotosContext();

    const handleDelete = () => {
        deletePhotoAndSync(photo.id);
    };

    return (
        <div className="group relative w-96 h-auto">
            <div className="transform-gpu duration-700 hover:scale-110 relative rounded-2xl overflow-hidden">
                <img
                    src={photo.photo_url}
                    className="h-auto w-full"
                    {...rest}
                />
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
