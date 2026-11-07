import {
  DndContext,
  DragOverlay,
  type DropAnimation,
  MouseSensor,
  closestCenter,
  defaultDropAnimationSideEffects,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Check, Trash2 } from 'react-feather';

import type { Photo } from '@/src/api/schemas/photos.schema';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

import { photoAnnouncements } from './announcements';
import { formatPosition } from './format';
import { Thumbnail } from './Thumbnail';

// A held photo tilts and lifts off the grid. It eases into that on pickup
// and back out as it drops, so it lands flat on its spot without a snap.
const LIFT_SHADOW = '0 28px 50px -14px rgb(0 0 0 / 0.9)';
const FLAT_SHADOW = '0 0 0 0 rgb(0 0 0 / 0)';
const SETTLE_MS = 280;
const SETTLE_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

const hideDroppedTile = defaultDropAnimationSideEffects({
  styles: { active: { opacity: '0' } },
});

const dropAnimation: DropAnimation = {
  duration: SETTLE_MS,
  easing: SETTLE_EASING,
  sideEffects: params => {
    params.dragOverlay.node.querySelector('[data-lift]')?.animate(
      [
        { rotate: '-2.5deg', scale: '1.04', boxShadow: LIFT_SHADOW },
        { rotate: '0deg', scale: '1', boxShadow: FLAT_SHADOW },
      ],
      { duration: SETTLE_MS, easing: SETTLE_EASING, fill: 'forwards' },
    );
    return hideDroppedTile(params);
  },
};

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

interface LibraryGridProps {
  photos: Photo[];
  selectedIds: string[];
  onToggle: (photoId: string) => void;
  onDelete: (photoId: string) => void;
  /** Called when `activeId` is dropped onto `overId`'s spot. */
  onMove: (activeId: string, overId: string) => void;
}

/**
 * The editor's grid of numbered square tiles. Clicking a tile selects it;
 * dragging one with a mouse moves it. Touch never starts a drag here, so
 * on a phone a tap always selects and reordering lives in Arrange mode.
 */
export function LibraryGrid({
  photos,
  selectedIds,
  onToggle,
  onDelete,
  onMove,
}: LibraryGridProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
  );

  const selecting = selectedIds.length > 0;
  const activePhoto = photos.find(p => p.id === activeId);
  const ids = photos.map(p => p.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      accessibility={{ announcements: photoAnnouncements(ids) }}
      onDragStart={({ active }) => setActiveId(String(active.id))}
      onDragCancel={() => setActiveId(null)}
      onDragEnd={({ active, over }) => {
        setActiveId(null);
        if (over && active.id !== over.id) {
          onMove(String(active.id), String(over.id));
        }
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <ol {...stylex.props(styles.grid)}>
          {photos.map((photo, index) => (
            <LibraryTile
              key={photo.id}
              photo={photo}
              position={index + 1}
              selected={selectedIds.includes(photo.id)}
              selecting={selecting}
              // Hidden while selecting, which has its own Delete, and while
              // any photo is being dragged.
              deletable={!selecting && activeId === null}
              onToggle={() => onToggle(photo.id)}
              onDelete={() => onDelete(photo.id)}
            />
          ))}
        </ol>
      </SortableContext>
      <DragOverlay
        dropAnimation={prefersReducedMotion() ? null : dropAnimation}
      >
        {activePhoto ? (
          // dnd-kit measures this outer box to find where the drop lands, so
          // it stays untransformed; the tilt lives on the inner layer.
          <div {...stylex.props(styles.overlayFrame)}>
            <div data-lift {...stylex.props(styles.lifted)}>
              <Thumbnail photoName={activePhoto.name} />
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

interface LibraryTileProps {
  photo: Photo;
  position: number;
  selected: boolean;
  selecting: boolean;
  deletable: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function LibraryTile({
  photo,
  position,
  selected,
  selecting,
  deletable,
  onToggle,
  onDelete,
}: LibraryTileProps) {
  const { setNodeRef, listeners, transform, transition, isDragging } =
    useSortable({ id: photo.id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...stylex.props(
        stylex.defaultMarker(),
        styles.tile,
        isDragging && styles.slot,
      )}
      {...listeners}
    >
      <button
        type="button"
        aria-pressed={selected}
        aria-label={`Photo ${position}`}
        onClick={onToggle}
        {...stylex.props(
          styles.select,
          selected && styles.selected,
          isDragging && styles.invisible,
        )}
      >
        <Thumbnail
          photoName={photo.name}
          xstyle={selecting && !selected ? styles.dimmed : null}
        />
        <span {...stylex.props(styles.badge)}>{formatPosition(position)}</span>
        {selected ? (
          <span {...stylex.props(styles.mark, styles.checked)}>
            <Check size={14} strokeWidth={3} aria-hidden />
          </span>
        ) : selecting ? (
          <span {...stylex.props(styles.mark, styles.unchecked)} />
        ) : null}
      </button>
      {deletable ? (
        <button
          type="button"
          aria-label={`Delete photo ${position}`}
          // Keeps a press on the button from starting a drag.
          onMouseDown={e => e.stopPropagation()}
          onClick={onDelete}
          {...stylex.props(styles.delete)}
        >
          <Trash2 size={16} aria-hidden />
        </button>
      ) : null}
    </li>
  );
}

const liftIn = stylex.keyframes({
  from: { rotate: '0deg', scale: 1, boxShadow: FLAT_SHADOW },
});

const styles = stylex.create({
  grid: {
    display: 'grid',
    gridTemplateColumns: {
      default: 'repeat(3, minmax(0, 1fr))',
      [breakpoints.sm]: 'repeat(auto-fill, minmax(10.5rem, 1fr))',
    },
    gap: { default: '3px', [breakpoints.sm]: '0.875rem' },
    listStyle: 'none',
  },
  tile: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: { default: 4, [breakpoints.sm]: 12 },
    touchAction: 'manipulation',
  },
  // The empty spot a dragged photo will drop into.
  slot: {
    outline: `2px dashed ${colors.highlight}`,
    outlineOffset: -2,
    backgroundColor: colors.highlightSoft,
  },
  select: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
    borderRadius: 'inherit',
    backgroundColor: colors.raised,
    cursor: { default: 'pointer', [breakpoints.finePointer]: 'grab' },
    outlineWidth: 2,
    outlineStyle: 'solid',
    outlineColor: {
      default: 'transparent',
      ':focus-visible': colors.highlightHover,
    },
    outlineOffset: { default: 2, [breakpoints.sm]: 3 },
    transitionProperty: 'outline-color',
    transitionDuration: '150ms',
  },
  selected: {
    outlineColor: colors.highlight,
  },
  invisible: {
    opacity: 0,
  },
  dimmed: {
    opacity: 0.55,
  },
  badge: {
    position: 'absolute',
    left: { default: 6, [breakpoints.sm]: 8 },
    bottom: { default: 6, [breakpoints.sm]: 8 },
    minWidth: '1.625rem',
    paddingBlock: 2,
    paddingInline: 6,
    borderRadius: 6,
    backgroundColor: 'rgb(10 10 10 / 0.72)',
    color: colors.textLight,
    fontSize: { default: '0.6875rem', [breakpoints.sm]: '0.75rem' },
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
  },
  mark: {
    position: 'absolute',
    left: { default: 6, [breakpoints.sm]: 8 },
    top: { default: 6, [breakpoints.sm]: 8 },
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '1.625rem',
    height: '1.625rem',
    borderRadius: 9999,
  },
  checked: {
    backgroundColor: colors.highlight,
    color: colors.onHighlight,
  },
  unchecked: {
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'rgb(255 255 255 / 0.85)',
    backgroundColor: 'rgb(10 10 10 / 0.3)',
  },
  // Shown on hover or keyboard focus, and only with a mouse: on touch it
  // would appear on every tap.
  delete: {
    position: 'absolute',
    top: 8,
    right: 8,
    display: {
      default: 'none',
      [breakpoints.finePointer]: {
        default: 'none',
        [stylex.when.ancestor(':hover')]: 'flex',
        [stylex.when.ancestor(':focus-within')]: 'flex',
      },
    },
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderRadius: 8,
    cursor: 'pointer',
    color: colors.dangerText,
    backgroundColor: {
      default: 'rgb(10 10 10 / 0.78)',
      ':hover': colors.dangerSoft,
    },
  },
  overlayFrame: {
    width: '100%',
    height: '100%',
  },
  lifted: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 12,
    cursor: 'grabbing',
    rotate: '-2.5deg',
    scale: 1.04,
    boxShadow: LIFT_SHADOW,
    animationName: {
      default: liftIn,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationDuration: '180ms',
    animationTimingFunction: SETTLE_EASING,
  },
});
