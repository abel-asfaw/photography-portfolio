import classNames from 'classnames';
import { useRef, useState } from 'react';
import { Loader, UploadCloud } from 'react-feather';

import { Button } from '@/src/components/Button';
import { FileInput } from '@/src/components/FileInput';
import { usePhotosAPI } from '@/src/hooks/usePhotosAPI';
import { usePhotosStore } from '@/src/store/photosStore';

export function PhotoUploader() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

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
            setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    const buttonClasses = classNames('bg-green-600 text-white', {
        'cursor-not-allowed': !selectedFile,
        'opacity-50': !selectedFile,
        'hover:bg-green-700': !!selectedFile,
    });

    const UploadIcon = isLoading ? Loader : UploadCloud;

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
                <UploadIcon className={isLoading ? 'animate-spin' : ''} />
            </Button>
        </div>
    );
}
