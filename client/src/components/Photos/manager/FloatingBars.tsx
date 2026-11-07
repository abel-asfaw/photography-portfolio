import * as stylex from '@stylexjs/stylex';
import { X } from 'react-feather';

import { Button } from '@/src/components/ui';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

import { plural } from './format';

interface SelectionBarProps {
  count: number;
  onMoveToStart: () => void;
  onMoveToEnd: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/** Floats over the grid while photos are selected. */
export function SelectionBar({
  count,
  onMoveToStart,
  onMoveToEnd,
  onDelete,
  onClear,
}: SelectionBarProps) {
  return (
    <div
      role="toolbar"
      aria-label="Selected photos"
      {...stylex.props(styles.floating, styles.selectionBar)}
    >
      <span {...stylex.props(styles.count)} aria-live="polite">
        {count} selected
      </span>
      <div {...stylex.props(styles.actions)}>
        <Button onClick={onMoveToStart}>Move to start</Button>
        <Button onClick={onMoveToEnd}>Move to end</Button>
        <Button variant="danger" onClick={onDelete}>
          Delete
        </Button>
        <Button
          variant="ghost"
          iconOnly
          aria-label="Clear selection"
          onClick={onClear}
        >
          <X size={18} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

interface UndoToastProps {
  count: number;
  onUndo: () => void;
}

/** Offers to bring back photos that were just deleted. */
export function UndoToast({ count, onUndo }: UndoToastProps) {
  return (
    <output {...stylex.props(styles.floating, styles.toast)}>
      <span>{plural(count, 'photo')} deleted</span>
      <Button onClick={onUndo} xstyle={styles.undo}>
        Undo
      </Button>
    </output>
  );
}

const styles = stylex.create({
  floating: {
    position: 'fixed',
    zIndex: 30,
    left: { default: '1rem', [breakpoints.sm]: '50%' },
    right: { default: '1rem', [breakpoints.sm]: 'auto' },
    translate: { default: null, [breakpoints.sm]: '-50% 0' },
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.5rem',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: '0.875rem',
    backgroundColor: colors.raised,
    color: colors.textLight,
    boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.75)',
  },
  selectionBar: {
    bottom: 'max(1rem, env(safe-area-inset-bottom))',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  count: {
    flexBasis: { default: '100%', [breakpoints.sm]: 'auto' },
    paddingInline: '0.75rem 0.5rem',
    paddingBlock: { default: '0.25rem', [breakpoints.sm]: 0 },
    fontWeight: 600,
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '0.375rem',
  },
  // Sits above the phone's bottom bar; on wider screens, near the bottom.
  toast: {
    bottom: {
      default: 'calc(5.75rem + env(safe-area-inset-bottom))',
      [breakpoints.sm]: '1.5rem',
    },
    justifyContent: 'space-between',
    gap: '1rem',
    paddingLeft: '1.125rem',
  },
  undo: {
    color: colors.highlight,
  },
});
