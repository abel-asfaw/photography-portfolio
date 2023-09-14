import usePhotosContext from '../hooks/usePhotosContext';

export default function Photo({ photo, ...rest }) {
    const { deletePhotoAndSync } = usePhotosContext();

    const handleDelete = () => {
        deletePhotoAndSync(photo.id);
    };

    return (
        <div>
            <img
                src={photo.photo_url}
                className="h-auto w-96 transform-gpu rounded-2xl duration-700 hover:scale-110"
                {...rest}
            />
            <div className="actions">
                <button className="bg-slate-300" onClick={handleDelete}>
                    Delete
                </button>
            </div>
        </div>
    );
}
