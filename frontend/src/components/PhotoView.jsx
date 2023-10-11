import { motion } from 'framer-motion';
import { useState } from 'react';
import { MdClose } from 'react-icons/md';
import usePhotosContext from '../hooks/usePhotosContext';
import Button from './Button';

export default function PhotoView({ photoId, photoUrl, canDelete }) {
    const { deletePhotoAndSync } = usePhotosContext();
    const [isDeleted, setIsDeleted] = useState(false);

    const handleDelete = () => {
        setIsDeleted(true);
        setTimeout(() => {
            deletePhotoAndSync(photoId);
        }, 400);
    };

    return (
        <motion.div
            className="group relative h-auto w-96"
            animate={isDeleted ? { opacity: 0 } : { opacity: 1 }}
        >
            <div className="relative transform-gpu overflow-hidden rounded-2xl duration-700 hover:scale-110">
                <img src={photoUrl} className="h-auto w-full" loading="lazy" />
                {canDelete && (
                    <Button
                        primary
                        circular
                        onClick={handleDelete}
                        className="absolute right-2 top-2 opacity-0 shadow-sm shadow-zinc-700 group-hover:opacity-100"
                    >
                        <MdClose size={12} color="black" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
