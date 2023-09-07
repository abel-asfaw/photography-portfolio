import classNames from 'classnames';
import Spinner from './Spinner';
import { useState } from 'react';

export default function FileInput({
    fileInputRef,
    onInputChange,
    onFileUpload,
    isFileSelected,
    showSpinner
}) {
    const handleButtonClick = () => {
        onFileUpload();
        fileInputRef.current.value = '';
    };

    const buttonClasses = classNames(
        'flex gap-2 rounded-md border-0 bg-green-600 px-4 py-2 text-sm font-semibold text-white',
        {
            'cursor-not-allowed': !isFileSelected,
            'opacity-50': !isFileSelected,
            'hover:bg-green-700': isFileSelected,
        },
    );

    return (
        <div className="flex flex-wrap items-center justify-center gap-4 p-5 sm:p-10">
            <input
                ref={fileInputRef}
                type="file"
                onChange={onInputChange}
                className="rounded-md bg-zinc-800 text-sm text-gray-400 file:mr-2 file:rounded-md file:rounded-r-none file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-sky-600"
            />
            <button
                type="button"
                disabled={!isFileSelected}
                onClick={handleButtonClick}
                className={buttonClasses}
            >
                {showSpinner && <Spinner />}
                Upload
            </button>
        </div>
    );
}
