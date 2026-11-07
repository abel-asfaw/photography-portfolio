import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { onBeforeSignOut } from '@/src/api/beforeSignOut';
import { useDeletePhotos } from '@/src/api/services/photos.query';

/** How long a delete can be undone before it is sent. */
export const UNDO_DELAY_MS = 5000;

/**
 * Deletes photos after a short delay so they can be undone. Deleted photos
 * are `hiddenIds` straight away and stay hidden until the request settles;
 * any that fail to delete come back. A pending delete is sent at once when
 * another one starts, when the editor unmounts, before signing out (while
 * the session can still authorize it), or when the page is hidden.
 */
export function useDeferredDelete() {
  const { mutateAsync: deletePhotos } = useDeletePhotos();
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [pendingIds, setPendingIds] = useState<string[] | null>(null);
  const pending = useRef<string[] | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const unhide = (ids: string[]) =>
    setHiddenIds(prev => prev.filter(id => !ids.includes(id)));

  const takePending = () => {
    window.clearTimeout(timer.current);
    const ids = pending.current;
    pending.current = null;
    setPendingIds(null);
    return ids;
  };

  /** Sends the pending delete; `keepalive` lets it outlive the page. */
  const flush = async (keepalive = false) => {
    const ids = takePending();
    if (!ids) return;
    try {
      await deletePhotos({ photoIds: ids, keepalive });
    } catch (error) {
      console.error('Failed to delete photos', error);
    } finally {
      unhide(ids);
    }
  };

  const remove = (ids: string[]) => {
    void flush();
    pending.current = ids;
    setPendingIds(ids);
    setHiddenIds(prev => [...prev, ...ids]);
    timer.current = window.setTimeout(() => void flush(), UNDO_DELAY_MS);
  };

  const undo = () => {
    const ids = takePending();
    if (ids) unhide(ids);
  };

  const send = useEffectEvent((keepalive: boolean) => flush(keepalive));
  useEffect(() => {
    const onPageHide = () => void send(true);
    window.addEventListener('pagehide', onPageHide);
    const unregister = onBeforeSignOut(() => send(false));
    return () => {
      window.removeEventListener('pagehide', onPageHide);
      unregister();
      void send(false);
    };
  }, []);

  return { hiddenIds, pendingIds, remove, undo };
}
