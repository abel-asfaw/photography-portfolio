import { motion } from 'framer-motion';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';

import Button from '@/src/components/Button';
import { deletePhotoById } from '@/src/api/PhotosAPI';
import { useAuth0 } from '@auth0/auth0-react';
import { usePhotosStore } from '@/src/store/photosStore';

interface PhotoViewProps {
    photoId: string;
    photoUrl: string;
    canDelete: boolean;
}

export default function PhotoView({
    photoId,
    photoUrl,
    canDelete,
}: PhotoViewProps) {
    const [isDeleted, setIsDeleted] = useState(false);

    const removePhoto = usePhotosStore(state => state.removePhoto);

    const { getAccessTokenSilently } = useAuth0();

    const handleDelete = async () => {
        const accessToken = await getAccessTokenSilently();
        setIsDeleted(true);
        setTimeout(() => {
            removePhoto(photoId);
            deletePhotoById(photoId, accessToken);
        }, 400);
    };

    return (
        <motion.div
            className="group relative h-auto w-96"
            animate={isDeleted ? { opacity: 0 } : { opacity: 1 }}
        >
            <div className="relative transform-gpu overflow-hidden rounded-xl duration-700 will-change-transform hover:scale-110">
                <img
                    src={photoUrl}
                    srcSet={photoUrl}
                    className="h-auto w-full"
                    loading="lazy"
                    crossOrigin="anonymous"
                />
                {canDelete && (
                    <Button
                        primary
                        circular
                        onClick={handleDelete}
                        className="absolute right-2 top-2 opacity-0 shadow-sm shadow-zinc-700 group-hover:opacity-100"
                    >
                        <MdClose size={14} color="black" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
