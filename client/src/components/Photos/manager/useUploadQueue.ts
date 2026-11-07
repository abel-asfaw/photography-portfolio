import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';

import { onBeforeSignOut } from '@/src/api/beforeSignOut';
import { MAX_UPLOAD_MB } from '@/src/api/limits';
import { useUploadPhoto } from '@/src/api/services/photos.query';

export type UploadStatus = 'waiting' | 'uploading' | 'done' | 'error';

export interface UploadItem {
  id: string;
  file: File;
  /** An object URL for the local file, shown before it is uploaded. */
  previewUrl: string;
  status: UploadStatus;
  /** From 0 to 1 while uploading. */
  progress: number;
  error?: string;
}

/** How long a finished upload stays in the list. */
export const DONE_LINGER_MS = 3000;

const megabytes = (bytes: number) => Math.round(bytes / (1024 * 1024));

/** Why a file can't be uploaded, or undefined if it can. */
export const validateUpload = (file: File) => {
  if (!file.type.startsWith('image/')) return 'Not an image';
  if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
    return `Too large (${megabytes(file.size)} MB). The limit is ${MAX_UPLOAD_MB} MB.`;
  }
  return undefined;
};

const uploadErrorMessage = (error: unknown) => {
  if (isAxiosError<{ detail?: unknown }>(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return 'Upload failed. Try again.';
};

/**
 * Uploads photos one at a time, so they join the end of the gallery in the
 * order they were picked. Files that fail validation are listed as errors
 * without being sent. Finished uploads drop off the list after a moment;
 * errors stay until dismissed. Signing out drops the files still waiting,
 * which could no longer be authorized.
 */
export function useUploadQueue() {
  const { mutateAsync: upload } = useUploadPhoto();
  const [items, setItems] = useState<UploadItem[]>([]);
  const queue = useRef<UploadItem[]>([]);
  const running = useRef(false);
  const previewUrls = useRef(new Set<string>());

  const update = (id: string, patch: Partial<UploadItem>) =>
    setItems(prev => prev.map(i => (i.id === id ? { ...i, ...patch } : i)));

  const dismiss = (ids: string[]) =>
    setItems(prev =>
      prev.filter(item => {
        if (!ids.includes(item.id)) return true;
        URL.revokeObjectURL(item.previewUrl);
        previewUrls.current.delete(item.previewUrl);
        return false;
      }),
    );

  const run = async () => {
    if (running.current) return;
    running.current = true;
    for (let item = queue.current.shift(); item; item = queue.current.shift()) {
      const { id, file } = item;
      update(id, { status: 'uploading' });
      try {
        await upload({
          file,
          onProgress: progress => update(id, { progress }),
        });
        update(id, { status: 'done', progress: 1 });
        window.setTimeout(() => dismiss([id]), DONE_LINGER_MS);
      } catch (error) {
        update(id, { status: 'error', error: uploadErrorMessage(error) });
      }
    }
    running.current = false;
  };

  const add = (files: Iterable<File>) => {
    const added = Array.from(files, (file): UploadItem => {
      const error = validateUpload(file);
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return {
        id: crypto.randomUUID(),
        file,
        previewUrl,
        status: error ? 'error' : 'waiting',
        progress: 0,
        error,
      };
    });
    if (!added.length) return;
    setItems(prev => [...prev, ...added]);
    queue.current.push(...added.filter(item => item.status === 'waiting'));
    void run();
  };

  /** Clears finished and failed uploads, leaving those still to go. */
  const clearSettled = () =>
    dismiss(
      items
        .filter(i => i.status === 'done' || i.status === 'error')
        .map(i => i.id),
    );

  useEffect(() => {
    const urls = previewUrls.current;
    const unregister = onBeforeSignOut(() => {
      queue.current = [];
    });
    return () => {
      unregister();
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const remaining = items.filter(
    i => i.status === 'waiting' || i.status === 'uploading',
  ).length;
  const failed = items.filter(i => i.status === 'error').length;

  return { items, remaining, failed, add, dismiss, clearSettled };
}
