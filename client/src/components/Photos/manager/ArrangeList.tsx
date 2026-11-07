import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers';
import { PointerActivationConstraints } from '@dnd-kit/dom';
import { arrayMove, move } from '@dnd-kit/helpers';
import {
  DragDropProvider,
  KeyboardSensor,
  PointerSensor,
} from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import * as stylex from '@stylexjs/stylex';
import { useId, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

import type { Photo } from '@/src/api/schemas/photos.schema';
import { formatPosition } from '@/src/components/Photos/format';
import { Button } from '@/src/components/ui';
import { shared } from '@/src/styles/shared';
import { breakpoints, colors, radii } from '@/src/styles/tokens.stylex';

import { withPhotoAnnouncements } from './announcements';
import { Thumbnail } from './Thumbnail';

// The handle drags once it has moved 4px, for every kind of pointer. The
// default for touch is a 250ms long press, which is exactly when iOS shows
// its image preview. The keyboard sensor lets the focused handle pick a
// photo up with Space and move it with the arrow keys.
const sensors = [
  PointerSensor.configure({
    activationConstraints: () => [
      new PointerActivationConstraints.Distance({ value: 4 }),
    ],
  }),
  KeyboardSensor,
];

const modifiers = [RestrictToVerticalAxis];

interface ArrangeListProps {
  photos: Photo[];
  onCancel: () => void;
  /** Called with the new order; nothing is saved until then. */
  onDone: (photos: Photo[]) => void;
}

/**
 * Reordering as a list, built for touch. Only the handle starts a drag,
 * straight away rather than after a long press, so iOS never shows its
 * image preview; the arrows and the position picker need no drag at all.
 */
export function ArrangeList({ photos, onCancel, onDone }: ArrangeListProps) {
  const titleId = useId();
  const [draft, setDraft] = useState(photos);
  const plugins = useMemo(
    () => withPhotoAnnouncements(draft.length),
    [draft.length],
  );
  const moveTo = (from: number, to: number) => {
    if (to < 0 || to >= draft.length || from === to) return;
    setDraft(prev => arrayMove(prev, from, to));
  };

  return (
    <section aria-labelledby={titleId} {...stylex.props(styles.page)}>
      <header {...stylex.props(styles.bar)}>
        <Button variant="ghost" onClick={onCancel} xstyle={styles.start}>
          Cancel
        </Button>
        <h1 id={titleId} {...stylex.props(styles.title)}>
          Arrange
        </h1>
        <Button
          variant="primary"
          onClick={() => onDone(draft)}
          xstyle={styles.end}
        >
          Done
        </Button>
      </header>
      <p {...stylex.props(styles.hint)}>
        Drag the handle, use the arrows, or tap a number.
      </p>
      <DragDropProvider
        sensors={sensors}
        modifiers={modifiers}
        plugins={plugins}
        onDragEnd={event => {
          if (!event.canceled) setDraft(move(draft, event));
        }}
      >
        <ol {...stylex.props(styles.list)}>
          {draft.map((photo, index) => (
            <ArrangeRow
              key={photo.id}
              photo={photo}
              index={index}
              total={draft.length}
              onMoveTo={to => moveTo(index, to)}
            />
          ))}
        </ol>
      </DragDropProvider>
    </section>
  );
}

interface ArrangeRowProps {
  photo: Photo;
  index: number;
  total: number;
  /** Moves this photo to a zero-based index. */
  onMoveTo: (index: number) => void;
}

function ArrangeRow({ photo, index, total, onMoveTo }: ArrangeRowProps) {
  const { ref, handleRef, isDragging } = useSortable({ id: photo.id, index });
  const position = index + 1;

  return (
    <li ref={ref} {...stylex.props(styles.row, isDragging && styles.rowLifted)}>
      <select
        aria-label={`Position of photo ${position}`}
        value={position}
        onChange={e => onMoveTo(Number(e.target.value) - 1)}
        {...stylex.props(
          styles.position,
          shared.focusRing,
          isDragging && styles.accent,
        )}
      >
        {Array.from({ length: total }, (_, i) => (
          <option key={i} value={i + 1}>
            {formatPosition(i + 1)}
          </option>
        ))}
      </select>
      <Thumbnail photoName={photo.name} size={144} xstyle={styles.thumb} />
      <span {...stylex.props(styles.spacer)} />
      <Button
        variant="ghost"
        iconOnly
        aria-label={`Move photo ${position} up`}
        disabled={position === 1}
        onClick={() => onMoveTo(position - 2)}
      >
        <ChevronUp size={18} aria-hidden />
      </Button>
      <Button
        variant="ghost"
        iconOnly
        aria-label={`Move photo ${position} down`}
        disabled={position === total}
        onClick={() => onMoveTo(position)}
      >
        <ChevronDown size={18} aria-hidden />
      </Button>
      <button
        type="button"
        ref={handleRef}
        aria-label={`Drag photo ${position}`}
        {...stylex.props(
          styles.handle,
          shared.focusRing,
          isDragging && styles.handleActive,
        )}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="9" cy="6" r="1.6" />
          <circle cx="15" cy="6" r="1.6" />
          <circle cx="9" cy="12" r="1.6" />
          <circle cx="15" cy="12" r="1.6" />
          <circle cx="9" cy="18" r="1.6" />
          <circle cx="15" cy="18" r="1.6" />
        </svg>
      </button>
    </li>
  );
}

const styles = stylex.create({
  page: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxWidth: '40rem',
    marginInline: 'auto',
    paddingInline: { default: '0.75rem', [breakpoints.sm]: '2rem' },
    paddingTop: { default: '0.5rem', [breakpoints.sm]: '2.5rem' },
    paddingBottom: '4rem',
    color: colors.textLight,
  },
  bar: {
    position: 'sticky',
    top: { default: '3.75rem', [breakpoints.sm]: '5rem' },
    zIndex: 10,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    paddingBlock: '0.5rem',
    backgroundColor: `color-mix(in srgb, ${colors.page} 90%, transparent)`,
  },
  start: {
    justifySelf: 'start',
  },
  end: {
    justifySelf: 'end',
  },
  title: {
    fontSize: '1.0625rem',
    fontWeight: 600,
  },
  hint: {
    paddingTop: '0.375rem',
    paddingBottom: '0.875rem',
    paddingInline: '0.5rem',
    fontSize: '0.8125rem',
    color: colors.textSubtle,
    textAlign: 'center',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
    listStyle: 'none',
  },
  row: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    height: '4rem',
    paddingInline: '0.25rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.borderSubtle,
    borderRadius: radii.xl,
    backgroundColor: colors.card,
    // The lift eases in and out as a photo is picked up and dropped.
    transitionProperty: 'scale, box-shadow, border-color, background-color',
    transitionDuration: '180ms',
  },
  rowLifted: {
    zIndex: 5,
    borderColor: colors.highlight,
    backgroundColor: colors.raised,
    scale: 1.03,
    boxShadow: '0 22px 40px -12px rgb(0 0 0 / 0.9)',
  },
  position: {
    flexShrink: 0,
    width: '2.75rem',
    height: '2.75rem',
    borderRadius: radii.md,
    appearance: 'none',
    backgroundColor: { default: 'transparent', ':hover': colors.raised },
    color: colors.textCaption,
    fontSize: '0.875rem',
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'center',
    textAlignLast: 'center',
    cursor: 'pointer',
  },
  accent: {
    color: colors.highlight,
  },
  thumb: {
    flexShrink: 0,
    width: '3rem',
    height: '3rem',
    borderRadius: radii.sm,
  },
  spacer: {
    flexGrow: 1,
  },
  handle: {
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2.75rem',
    height: '3.25rem',
    borderRadius: radii.md,
    color: colors.textCaption,
    backgroundColor: 'transparent',
    cursor: { default: 'grab', ':active': 'grabbing' },
    // Lets a touch on the handle drag instead of scrolling the page.
    touchAction: 'none',
    WebkitTouchCallout: 'none',
    userSelect: 'none',
  },
  handleActive: {
    color: colors.highlight,
    backgroundColor: colors.highlightMuted,
  },
});
