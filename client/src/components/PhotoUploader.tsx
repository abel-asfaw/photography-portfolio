import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { Loader, UploadCloud } from 'react-feather';

import { queryClient } from '@/src/App';
import { Button } from '@/src/components/Button';
import { FileInput } from '@/src/components/FileInput';
import { useUploadPhotoMutation } from '../hooks/photos.query';

export function PhotoUploader() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    isPending,
    isSuccess,
    mutateAsync: uploadMutateAsync,
  } = useUploadPhotoMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = e.target.files;
    setSelectedFiles(files);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles) return;

    await Promise.all(
      [...(selectedFiles ?? [])].map(file => uploadMutateAsync(file)),
    );
    queryClient.invalidateQueries({ queryKey: ['photos'] });
  };

  useEffect(() => {
    if (isSuccess) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFiles(null);
    }
  }, [isSuccess]);

  const buttonClasses = classNames('bg-green-600 text-white', {
    'cursor-not-allowed': !selectedFiles,
    'opacity-50': !selectedFiles,
    'hover:bg-green-700': !!selectedFiles,
  });

  const UploadIcon = isPending ? Loader : UploadCloud;

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
        disabled={!selectedFiles}
        onClick={handleFileUpload}
      >
        <UploadIcon className={isPending ? 'animate-spin' : ''} />
      </Button>
    </div>
  );
}
