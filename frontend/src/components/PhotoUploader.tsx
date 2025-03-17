import classNames from 'classnames';
import { useRef, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { CgSpinner } from 'react-icons/cg';

import usePhotosContext from '@/src/hooks/usePhotosContext';
import Button from './Button';
import FileInput from './FileInput';

export default function PhotoUploader() {
    const [isFileSelected, setIsFileSelected] = useState<boolean>(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { showSpinner, uploadPhotoAndSync } = usePhotosContext();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const file = e.target.files[0];
        setSelectedFile(file);
        setIsFileSelected(!!file);
    };

    const handleFileUpload = async () => {
        if (!selectedFile) return;

        uploadPhotoAndSync(selectedFile);
        setIsFileSelected(false);
        fileInputRef.current!.value = '';
    };

    const displayUploadIcon = () => {
        const Icon = showSpinner ? CgSpinner : AiOutlineCloudUpload;

        return <Icon size={24} className={showSpinner ? 'animate-spin' : ''} />;
    };

    const buttonClasses = classNames('bg-green-600', {
        'cursor-not-allowed': !isFileSelected,
        'opacity-50': !isFileSelected,
        'hover:bg-green-700': isFileSelected,
    });

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 px-10 pt-10">
            <FileInput
                fileInputRef={fileInputRef}
                onChange={handleInputChange}
                accept="image/*"
            />
            <Button
                className={buttonClasses}
                disabled={!isFileSelected}
                onClick={handleFileUpload}
            >
                {displayUploadIcon()}
            </Button>
        </div>
    );
}
