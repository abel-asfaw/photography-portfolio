import classNames from 'classnames';
import { useRef, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { CgSpinner } from 'react-icons/cg';

import Button from '@/src/components/Button';
import FileInput from '@/src/components/FileInput';
import { usePhotosAPI } from '@/src/hooks/usePhotosAPI';
import { usePhotosStore } from '@/src/store/photosStore';

export default function PhotoUploader() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const addPhoto = usePhotosStore(state => state.addPhoto);
    const { uploadPhoto } = usePhotosAPI();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;
        try {
            setShowSpinner(true);
            const newPhoto = await uploadPhoto(selectedFile);
            if (newPhoto) {
                addPhoto(newPhoto);
            }
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setSelectedFile(null);
        } catch (error) {
            console.error('File upload failed:', error);
        } finally {
            setShowSpinner(false);
        }
    };

    const displayUploadIcon = () => {
        const Icon = showSpinner ? CgSpinner : AiOutlineCloudUpload;
        return <Icon size={24} className={showSpinner ? 'animate-spin' : ''} />;
    };

    const buttonClasses = classNames('bg-green-600', {
        'cursor-not-allowed': !selectedFile,
        'opacity-50': !selectedFile,
        'hover:bg-green-700': !!selectedFile,
    });

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 px-10 pt-10">
            <FileInput
                fileInputRef={fileInputRef}
                onChange={handleInputChange}
                accept="image/*"
                aria-label="Upload photo"
            />
            <Button
                className={buttonClasses}
                disabled={!selectedFile}
                onClick={handleFileUpload}
            >
                {displayUploadIcon()}
            </Button>
        </div>
    );
}
