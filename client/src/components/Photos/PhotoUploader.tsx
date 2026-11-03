import * as stylex from '@stylexjs/stylex';
import { useRef, useState } from 'react';
import { Loader, UploadCloud } from 'react-feather';

import { useUploadPhotos } from '@/src/api/services/photos.query';
import { Button, FileInput } from '@/src/components/ui';
import { colors } from '@/src/styles/tokens.stylex';

export function PhotoUploader() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { isPending, mutateAsync: uploadPhotos } = useUploadPhotos();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const files = e.target.files;
    setSelectedFiles(files);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles) return;

    const uploadedFiles = await uploadPhotos(selectedFiles);

    if (uploadedFiles.length > 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFiles(null);
    }
  };

  const canUpload = !!selectedFiles && !isPending;
  const UploadIcon = isPending ? Loader : UploadCloud;

  return (
    <div {...stylex.props(styles.uploader)}>
      <FileInput
        fileInputRef={fileInputRef}
        onChange={handleInputChange}
        accept="image/*"
        aria-label="Upload photo"
      />
      <Button
        xstyle={[styles.upload, canUpload ? styles.enabled : styles.disabled]}
        disabled={!canUpload}
        onClick={handleFileUpload}
      >
        <UploadIcon {...stylex.props(isPending && styles.spin)} />
      </Button>
    </div>
  );
}

const spin = stylex.keyframes({
  to: { transform: 'rotate(360deg)' },
});

const styles = stylex.create({
  uploader: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    paddingTop: '2.5rem',
  },
  upload: {
    color: colors.white,
  },
  enabled: {
    backgroundColor: { default: colors.success, ':hover': colors.successHover },
    cursor: 'pointer',
  },
  disabled: {
    backgroundColor: colors.success,
    cursor: 'not-allowed',
    opacity: 0.5,
  },
  spin: {
    animationName: spin,
    animationDuration: '1s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
});
