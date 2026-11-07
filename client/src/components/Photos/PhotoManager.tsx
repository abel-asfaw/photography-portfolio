import * as stylex from '@stylexjs/stylex';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Check, Plus, Upload } from 'react-feather';

import type { Photo } from '@/src/api/schemas/photos.schema';
import {
  useFetchPhotos,
  useReorderPhotos,
} from '@/src/api/services/photos.query';
import { Button } from '@/src/components/ui';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

import { ArrangeList } from './manager/ArrangeList';
import { SelectionBar, UndoToast } from './manager/FloatingBars';
import { plural } from './manager/format';
import { LibraryGrid } from './manager/LibraryGrid';
import { reconcileOrder } from './manager/order';
import { DropZone, UploadPanel } from './manager/Uploads';
import { useDeferredDelete } from './manager/useDeferredDelete';
import { useUploadQueue } from './manager/useUploadQueue';
import { statusMessage } from './statusMessage';

const hasFiles = (event: DragEvent) =>
  event.dataTransfer?.types.includes('Files') ?? false;

/**
 * The admin editor. The library is a grid of numbered tiles: select photos
 * to move or delete them together, drag with a mouse to reorder, and drop
 * files anywhere to upload. Arrange mode reorders as a list for touch.
 */
export function PhotoManager() {
  const { data: photos, isLoading, isError } = useFetchPhotos();
  const {
    mutate: reorder,
    status: reorderStatus,
    submittedAt: reorderedAt,
  } = useReorderPhotos();
  const deletes = useDeferredDelete();
  const uploads = useUploadQueue();

  const [localPhotos, setLocalPhotos] = useState<Photo[]>(photos ?? []);
  const [syncedPhotos, setSyncedPhotos] = useState(photos);
  const [selected, setSelected] = useState<string[]>([]);
  const [arranging, setArranging] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draggingFiles, setDraggingFiles] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  // Re-seed the optimistic local order whenever the server list changes.
  // Done during render rather than in an effect so there is no extra
  // commit showing stale order in between.
  if (photos && photos !== syncedPhotos) {
    setSyncedPhotos(photos);
    setLocalPhotos(photos);
  }

  const visible = localPhotos.filter(p => !deletes.hiddenIds.includes(p.id));
  const selectedIds = selected.filter(id => visible.some(p => p.id === id));
  const selectedPhotos = visible.filter(p => selectedIds.includes(p.id));
  const unselectedPhotos = visible.filter(p => !selectedIds.includes(p.id));

  /** Saves a new order for the visible photos. */
  const saveOrder = (next: Photo[]) => {
    // The API wants every photo, so ones waiting to be deleted keep their
    // slots, where an undo brings them back.
    const rest = [...next];
    const all = localPhotos.flatMap(p =>
      deletes.hiddenIds.includes(p.id) ? p : (rest.shift() ?? []),
    );
    all.push(...rest);
    if (all.every((p, i) => p.id === localPhotos[i]?.id)) return;
    setLocalPhotos(all);
    reorder(all.map(p => p.id));
  };

  const toggle = (photoId: string) =>
    setSelected(
      selectedIds.includes(photoId)
        ? selectedIds.filter(id => id !== photoId)
        : [...selectedIds, photoId],
    );

  const deletePhotos = (ids: string[]) => {
    setSelected([]);
    deletes.remove(ids);
  };

  const finishArranging = (draft: Photo[]) => {
    setArranging(false);
    // Photos added while arranging go at the end; removed ones drop out.
    saveOrder(reconcileOrder(draft, visible));
  };

  const browse = () => fileInput.current?.click();

  const addFiles = (files: FileList | null | undefined) => {
    if (!files?.length) return;
    uploads.add(files);
    setSheetOpen(true);
  };

  const hasSelection = selectedIds.length > 0;

  // Escape clears the selection.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelected([]);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Files dropped anywhere on the library are uploaded. A counter tracks
  // enter/leave pairs, which fire for every child the drag crosses.
  const acceptsFiles = useEffectEvent(
    (e: DragEvent) => hasFiles(e) && !arranging,
  );
  const onDropFiles = useEffectEvent((files: FileList | undefined) =>
    addFiles(files),
  );
  useEffect(() => {
    let depth = 0;
    const onEnter = (e: DragEvent) => {
      if (!acceptsFiles(e)) return;
      depth += 1;
      setDraggingFiles(true);
    };
    const onLeave = (e: DragEvent) => {
      if (!acceptsFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (depth === 0) setDraggingFiles(false);
    };
    const onOver = (e: DragEvent) => {
      if (acceptsFiles(e)) e.preventDefault();
    };
    const onDrop = (e: DragEvent) => {
      if (!acceptsFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDraggingFiles(false);
      onDropFiles(e.dataTransfer?.files);
    };
    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('dragover', onOver);
    window.addEventListener('drop', onDrop);
    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('drop', onDrop);
    };
  }, []);

  const fileInputElement = (
    <input
      ref={fileInput}
      type="file"
      accept="image/*"
      multiple
      hidden
      aria-label="Upload photos"
      onChange={e => {
        addFiles(e.target.files);
        e.target.value = '';
      }}
    />
  );

  const uploadPanel =
    uploads.items.length > 0 ? (
      <UploadPanel
        items={uploads.items}
        remaining={uploads.remaining}
        sheetOpen={sheetOpen}
        onAddMore={browse}
        onDismiss={id => uploads.dismiss([id])}
        onCloseSheet={() => {
          setSheetOpen(false);
          uploads.clearSettled();
        }}
      />
    ) : null;

  const undoToast =
    deletes.pendingIds && !hasSelection ? (
      <UndoToast count={deletes.pendingIds.length} onUndo={deletes.undo} />
    ) : null;

  if (arranging) {
    return (
      <>
        <ArrangeList
          photos={visible}
          onCancel={() => setArranging(false)}
          onDone={finishArranging}
        />
        {fileInputElement}
        {uploadPanel}
        {undoToast}
      </>
    );
  }

  // The editor has its own empty state, so only loading and errors here.
  const status = photos ? null : statusMessage({ photos, isLoading, isError });

  return (
    <div {...stylex.props(styles.page)}>
      {fileInputElement}
      <div {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.heading)}>
          <h1 {...stylex.props(styles.title)}>Photos</h1>
          {photos ? (
            <p {...stylex.props(styles.summary)}>
              {plural(visible.length, 'photo')}
              <SaveStatus status={reorderStatus} savedAt={reorderedAt} />
            </p>
          ) : null}
        </div>
        <div {...stylex.props(styles.headerActions)}>
          <Button
            onClick={() => setArranging(true)}
            disabled={visible.length < 2}
          >
            Arrange
          </Button>
          <Button variant="primary" onClick={browse}>
            <Upload size={16} strokeWidth={2.25} aria-hidden />
            Upload photos
          </Button>
        </div>
      </div>

      <div {...stylex.props(styles.uploads)}>
        <DropZone active={draggingFiles} onBrowse={browse} />
        {uploadPanel}
      </div>

      {status === null ? (
        visible.length > 0 ? (
          <LibraryGrid
            photos={visible}
            selectedIds={selectedIds}
            onToggle={toggle}
            onDelete={id => deletePhotos([id])}
            onReorder={saveOrder}
          />
        ) : (
          <div {...stylex.props(styles.empty)}>
            <p>No photos yet.</p>
            <Button variant="primary" onClick={browse}>
              Upload your first photos
            </Button>
          </div>
        )
      ) : (
        <p {...stylex.props(styles.empty)}>{status}</p>
      )}

      {hasSelection ? (
        <SelectionBar
          count={selectedIds.length}
          onMoveToStart={() => {
            saveOrder([...selectedPhotos, ...unselectedPhotos]);
            setSelected([]);
          }}
          onMoveToEnd={() => {
            saveOrder([...unselectedPhotos, ...selectedPhotos]);
            setSelected([]);
          }}
          onDelete={() => deletePhotos(selectedIds)}
          onClear={() => setSelected([])}
        />
      ) : (
        <nav aria-label="Photo actions" {...stylex.props(styles.phoneBar)}>
          <Button
            large
            onClick={() => setArranging(true)}
            disabled={visible.length < 2}
          >
            Arrange
          </Button>
          {uploads.remaining > 0 && !sheetOpen ? (
            <Button large onClick={() => setSheetOpen(true)}>
              Uploading {uploads.remaining}…
            </Button>
          ) : uploads.failed > 0 && !sheetOpen ? (
            // Failures that came in while the sheet was hidden.
            <Button large variant="danger" onClick={() => setSheetOpen(true)}>
              {uploads.failed} not added
            </Button>
          ) : (
            <Button large variant="primary" onClick={browse}>
              <Plus size={18} strokeWidth={2.25} aria-hidden />
              Add photos
            </Button>
          )}
        </nav>
      )}
      {undoToast}
    </div>
  );
}

interface SaveStatusProps {
  status: ReturnType<typeof useReorderPhotos>['status'];
  /** When the latest save started, so each new save replays the fade. */
  savedAt: number;
}

/**
 * Quiet unless the order is changing: "Saving…", then "Saved", which
 * fades away. A failed save stays until the next one.
 */
function SaveStatus({ status, savedAt }: SaveStatusProps) {
  return (
    <span aria-live="polite" {...stylex.props(styles.saveStatus)}>
      {status === 'pending' ? (
        <span {...stylex.props(styles.pill)}>Saving…</span>
      ) : status === 'error' ? (
        <span {...stylex.props(styles.pill, styles.pillError)}>
          Couldn&apos;t save the order
        </span>
      ) : status === 'success' ? (
        <span key={savedAt} {...stylex.props(styles.pill, styles.pillSaved)}>
          <Check size={12} strokeWidth={2.5} aria-hidden />
          Saved
        </span>
      ) : null}
    </span>
  );
}

const fadeOut = stylex.keyframes({
  '0%, 70%': { opacity: 1 },
  '100%': { opacity: 0 },
});

const styles = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    gap: { default: '1rem', [breakpoints.sm]: '1.75rem' },
    width: '100%',
    maxWidth: '77.5rem',
    marginInline: 'auto',
    paddingInline: { default: 0, [breakpoints.sm]: '2rem' },
    paddingTop: { default: '0.5rem', [breakpoints.sm]: '2.5rem' },
    // Room for the phone's bottom bar, or the floating selection bar.
    paddingBottom: { default: '9rem', [breakpoints.sm]: '7rem' },
    color: colors.textLight,
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '1rem',
    paddingInline: { default: '1rem', [breakpoints.sm]: 0 },
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  title: {
    fontSize: { default: '1.625rem', [breakpoints.sm]: '1.875rem' },
    fontWeight: 600,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },
  summary: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '0.625rem',
    fontSize: { default: '0.8125rem', [breakpoints.sm]: '0.875rem' },
    color: colors.textSubtle,
  },
  saveStatus: {
    display: 'inline-flex',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    paddingBlock: 2,
    paddingInline: '0.625rem',
    borderRadius: 9999,
    backgroundColor: colors.raised,
    color: colors.textSubtle,
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  pillSaved: {
    backgroundColor: colors.positiveSoft,
    color: colors.positive,
    animationName: fadeOut,
    animationDuration: '2.5s',
    animationFillMode: 'forwards',
  },
  pillError: {
    backgroundColor: colors.dangerSoft,
    color: colors.dangerSoftText,
  },
  headerActions: {
    display: { default: 'none', [breakpoints.sm]: 'flex' },
    gap: '0.625rem',
  },
  uploads: {
    display: { default: 'contents', [breakpoints.sm]: 'flex' },
    flexWrap: 'wrap',
    alignItems: 'stretch',
    gap: '1rem',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    paddingBlock: '5rem',
    color: colors.textSubtle,
    textAlign: 'center',
  },
  phoneBar: {
    position: 'fixed',
    zIndex: 30,
    left: 0,
    right: 0,
    bottom: 0,
    display: { default: 'grid', [breakpoints.sm]: 'none' },
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.625rem',
    paddingTop: '0.875rem',
    paddingInline: '1rem',
    paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: colors.borderSubtle,
    backgroundColor: 'rgb(14 14 16 / 0.92)',
    backdropFilter: 'blur(12px)',
  },
});
