import classNames from 'classnames';
import { useState, useRef } from 'react';
import usePhotosContext from '../hooks/usePhotosContext';
import FileInput from './FileInput';
import Button from './Button';
import Spinner from './Spinner';

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
                className={classNames('gap-2', buttonClasses)}
                disabled={!isFileSelected}
                onButtonClick={handleFileUpload}
            >
                {showSpinner && <Spinner />}
                Upload
            </Button>
        </div>
    );
}
