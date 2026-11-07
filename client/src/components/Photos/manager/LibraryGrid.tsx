import { Accessibility, PointerActivationConstraints } from '@dnd-kit/dom';
import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay, PointerSensor } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { Check, Trash2 } from 'react-feather';

import type { Photo } from '@/src/api/schemas/photos.schema';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

import { formatPosition } from './format';
import { Thumbnail } from './Thumbnail';

// A held photo tilts and lifts off the grid. It eases into that on pickup
// and back out while dnd-kit animates the drop, so it lands flat on its
// spot without a snap.
const LIFT_SHADOW = '0 28px 50px -14px rgb(0 0 0 / 0.9)';
const FLAT_SHADOW = '0 0 0 0 rgb(0 0 0 / 0)';
const SETTLE_MS = 280;
const SETTLE_EASING = 'cubic-bezier(0.2, 0, 0, 1)';

/** Set by dnd-kit on the overlay while its drop animation runs. */
const DROPPING = '[data-dnd-dropping]';

// Only a mouse drags, once it has moved 8px, so a click still selects.
// Touch never drags here: on a phone, reordering lives in Arrange mode.
// There is no keyboard sensor, since Space and Enter toggle selection.
const sensors = [
  PointerSensor.configure({
    activationConstraints: () => [
      new PointerActivationConstraints.Distance({ value: 8 }),
    ],
    preventActivation: event => event.pointerType !== 'mouse',
  }),
];

// The accessibility plugin would overwrite each tile's aria-pressed, which
// holds its selected state. Arrange mode is the accessible way to reorder,
// with its own announcements.
const withoutAccessibility = <T,>(defaults: T[]) =>
  defaults.filter(plugin => plugin !== Accessibility);

interface LibraryGridProps {
  photos: Photo[];
  selectedIds: string[];
  onToggle: (photoId: string) => void;
  onDelete: (photoId: string) => void;
  /** Called with the new order after a photo is dragged to a new spot. */
  onReorder: (photos: Photo[]) => void;
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
  onReorder,
}: LibraryGridProps) {
  const [dragging, setDragging] = useState(false);
  const selecting = selectedIds.length > 0;

  return (
    <DragDropProvider
      sensors={sensors}
      plugins={withoutAccessibility}
      onDragStart={() => setDragging(true)}
      onDragEnd={event => {
        setDragging(false);
        if (!event.canceled) onReorder(move(photos, event));
      }}
    >
      <ol {...stylex.props(styles.grid)}>
        {photos.map((photo, index) => (
          <LibraryTile
            key={photo.id}
            photo={photo}
            index={index}
            selected={selectedIds.includes(photo.id)}
            selecting={selecting}
            // Hidden while selecting, which has its own Delete, and while
            // any photo is being dragged.
            deletable={!selecting && !dragging}
            onToggle={() => onToggle(photo.id)}
            onDelete={() => onDelete(photo.id)}
          />
        ))}
      </ol>
      <DragOverlay
        dropAnimation={{ duration: SETTLE_MS, easing: SETTLE_EASING }}
        {...stylex.props(stylex.defaultMarker())}
      >
        {/* Rendered until the drop animation ends, not just the drag. */}
        {source => {
          const photo = photos.find(p => p.id === source.id);
          return photo ? (
            // dnd-kit measures the overlay to find where the drop lands, so
            // it stays untransformed; the tilt lives on this inner layer.
            <div {...stylex.props(styles.lifted)}>
              <Thumbnail photoName={photo.name} />
            </div>
          ) : null;
        }}
      </DragOverlay>
    </DragDropProvider>
  );
}

interface LibraryTileProps {
  photo: Photo;
  index: number;
  selected: boolean;
  selecting: boolean;
  deletable: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function LibraryTile({
  photo,
  index,
  selected,
  selecting,
  deletable,
  onToggle,
  onDelete,
}: LibraryTileProps) {
  // The select button is the handle, so a press on the delete button never
  // starts a drag.
  const { ref, handleRef, isDragSource, isDropping } = useSortable({
    id: photo.id,
    index,
  });
  const position = index + 1;

  return (
    <li
      ref={ref}
      {...stylex.props(
        stylex.defaultMarker(),
        styles.tile,
        isDragSource && styles.slot,
        // The overlay covers the spot while it settles into it.
        isDropping && styles.invisible,
      )}
    >
      <button
        ref={handleRef}
        type="button"
        aria-pressed={selected}
        aria-label={`Photo ${position}`}
        onClick={onToggle}
        {...stylex.props(
          styles.select,
          selected && styles.selected,
          isDragSource && styles.invisible,
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
  lifted: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    borderRadius: 12,
    cursor: 'grabbing',
    rotate: { default: '-2.5deg', [stylex.when.ancestor(DROPPING)]: '0deg' },
    scale: { default: 1.04, [stylex.when.ancestor(DROPPING)]: 1 },
    boxShadow: {
      default: LIFT_SHADOW,
      [stylex.when.ancestor(DROPPING)]: FLAT_SHADOW,
    },
    transitionProperty: 'rotate, scale, box-shadow',
    transitionDuration: `${SETTLE_MS}ms`,
    transitionTimingFunction: SETTLE_EASING,
    animationName: {
      default: liftIn,
      '@media (prefers-reduced-motion: reduce)': 'none',
    },
    animationDuration: '180ms',
    animationTimingFunction: SETTLE_EASING,
  },
});
