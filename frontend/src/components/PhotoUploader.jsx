import classNames from 'classnames';
import { useRef, useState } from 'react';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { CgSpinner } from 'react-icons/cg';

import usePhotosContext from '../hooks/usePhotosContext';
import Button from './Button';
import FileInput from './FileInput';

export default function PhotoUploader() {
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const { showSpinner, uploadPhotoAndSync } = usePhotosContext();

    const fileInputRef = useRef(null);

    const handleInputChange = e => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setIsFileSelected(!!file);
    };

    const handleFileUpload = async () => {
        uploadPhotoAndSync(selectedFile);
        setIsFileSelected(false);
        fileInputRef.current.value = '';
    };

    const displayUploadIcon = () => {
        const Icon = showSpinner ? CgSpinner : AiOutlineCloudUpload;
        const className = showSpinner && 'animate-spin';

        return <Icon size={24} className={className} />;
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
                onInputChange={handleInputChange}
                accept="image/*"
            />
            <Button
                className={buttonClasses}
                disabled={!isFileSelected}
                onButtonClick={handleFileUpload}
            >
                {displayUploadIcon()}
            </Button>
        </div>
    );
}
