import * as stylex from '@stylexjs/stylex';
import { Image as ImageIcon, X } from 'react-feather';

import { MAX_UPLOAD_MB } from '@/src/api/limits';
import { plural } from '@/src/components/Photos/format';
import { Button } from '@/src/components/ui';
import { shared } from '@/src/styles/shared';
import { breakpoints, colors, radii } from '@/src/styles/tokens.stylex';

import type { UploadItem } from './useUploadQueue';

interface DropZoneProps {
  /** Files are being dragged over the page. */
  active: boolean;
  onBrowse: () => void;
}

/** The desktop prompt to drop or pick photos; hidden on a phone. */
export function DropZone({ active, onBrowse }: DropZoneProps) {
  return (
    <button
      type="button"
      onClick={onBrowse}
      {...stylex.props(
        styles.dropZone,
        shared.focusRing,
        active && styles.dropZoneActive,
      )}
    >
      <ImageIcon size={22} strokeWidth={1.75} aria-hidden />
      <span>
        {active ? (
          'Drop to upload'
        ) : (
          <>
            Drop photos anywhere on this page, or{' '}
            <span {...stylex.props(styles.browse)}>browse</span>. Images up to{' '}
            {MAX_UPLOAD_MB} MB each.
          </>
        )}
      </span>
    </button>
  );
}

interface UploadPanelProps {
  items: UploadItem[];
  remaining: number;
  /** On a phone the panel is a sheet, shown only while this is true. */
  sheetOpen: boolean;
  onAddMore: () => void;
  onDismiss: (id: string) => void;
  onCloseSheet: () => void;
}

const statusLabel = (item: UploadItem) =>
  ({
    waiting: 'Waiting',
    uploading: `${Math.round(item.progress * 100)}%`,
    done: 'Added',
    error: item.error,
  })[item.status];

/**
 * Uploads in progress: a card beside the drop zone on wider screens and a
 * bottom sheet on a phone, which can be hidden while uploads carry on.
 */
export function UploadPanel({
  items,
  remaining,
  sheetOpen,
  onAddMore,
  onDismiss,
  onCloseSheet,
}: UploadPanelProps) {
  const failed = items.filter(i => i.status === 'error').length;
  const title =
    remaining > 0
      ? `Adding ${plural(remaining, 'photo')}`
      : failed > 0
        ? `${plural(failed, 'photo')} not added`
        : 'All added';

  return (
    <>
      {sheetOpen ? (
        <div
          aria-hidden
          onClick={onCloseSheet}
          {...stylex.props(styles.backdrop)}
        />
      ) : null}
      <section
        aria-label="Uploads"
        {...stylex.props(styles.panel, !sheetOpen && styles.sheetClosed)}
      >
        <div aria-hidden {...stylex.props(styles.grabber)} />
        <div {...stylex.props(styles.heading)}>
          <h2 {...stylex.props(styles.title)}>{title}</h2>
        </div>
        <ul {...stylex.props(styles.list)}>
          {items.map(item => (
            <li
              key={item.id}
              {...stylex.props(
                styles.item,
                item.status === 'error' && styles.itemError,
              )}
            >
              <img
                src={item.previewUrl}
                alt=""
                {...stylex.props(
                  styles.preview,
                  (item.status === 'waiting' || item.status === 'error') &&
                    styles.previewFaded,
                )}
              />
              <div {...stylex.props(styles.itemBody)}>
                <div {...stylex.props(styles.itemLine)}>
                  <span {...stylex.props(styles.fileName)}>
                    {item.file.name}
                  </span>
                  {item.status === 'error' ? null : (
                    <span
                      {...stylex.props(
                        styles.status,
                        item.status === 'done' && styles.statusDone,
                      )}
                    >
                      {statusLabel(item)}
                    </span>
                  )}
                </div>
                {item.status === 'error' ? (
                  <span {...stylex.props(styles.errorText)}>{item.error}</span>
                ) : (
                  // Decorative: the status beside the name reads the same.
                  <div aria-hidden {...stylex.props(styles.track)}>
                    <div
                      {...stylex.props(
                        styles.bar(item.progress),
                        item.status === 'done' && styles.barDone,
                      )}
                    />
                  </div>
                )}
              </div>
              {item.status === 'error' ? (
                <Button
                  variant="ghost"
                  iconOnly
                  aria-label={`Dismiss ${item.file.name}`}
                  onClick={() => onDismiss(item.id)}
                  xstyle={styles.dismiss}
                >
                  <X size={18} aria-hidden />
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
        <div {...stylex.props(styles.sheetActions)}>
          <Button large onClick={onAddMore}>
            Add more
          </Button>
          <Button large variant="primary" onClick={onCloseSheet}>
            {remaining > 0 ? 'Hide' : 'Done'}
          </Button>
        </div>
      </section>
    </>
  );
}

const styles = stylex.create({
  dropZone: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '20rem',
    display: { default: 'none', [breakpoints.sm]: 'flex' },
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.875rem',
    height: '6rem',
    paddingBlock: '1rem',
    paddingInline: '1.25rem',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: { default: colors.borderStrong, ':hover': colors.textMuted },
    borderRadius: radii.xxl,
    backgroundColor: colors.sunken,
    color: colors.textSubtle,
    fontSize: '0.875rem',
    textAlign: 'left',
    cursor: 'pointer',
    transitionProperty: 'border-color, background-color, color',
    transitionDuration: '150ms',
    outlineOffset: 2,
  },
  dropZoneActive: {
    borderColor: colors.highlight,
    backgroundColor: colors.highlightSoft,
    color: colors.textLight,
  },
  browse: {
    color: colors.textLight,
    textDecorationLine: 'underline',
    textUnderlineOffset: 3,
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 40,
    display: { default: 'block', [breakpoints.sm]: 'none' },
    backgroundColor: 'rgb(0 0 0 / 0.55)',
  },
  panel: {
    position: { default: 'fixed', [breakpoints.sm]: 'static' },
    zIndex: 41,
    left: 0,
    right: 0,
    bottom: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '22rem',
    display: 'flex',
    flexDirection: 'column',
    gap: { default: '1.125rem', [breakpoints.sm]: '0.75rem' },
    maxHeight: { default: '80vh', [breakpoints.sm]: 'none' },
    overflowY: 'auto',
    paddingTop: { default: '0.625rem', [breakpoints.sm]: '0.875rem' },
    paddingInline: { default: '1rem', [breakpoints.sm]: '1.125rem' },
    paddingBottom: {
      default: 'max(2rem, env(safe-area-inset-bottom))',
      [breakpoints.sm]: '0.875rem',
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: {
      default: colors.border,
      [breakpoints.sm]: colors.borderPanel,
    },
    borderBottomWidth: { default: 0, [breakpoints.sm]: 1 },
    borderRadius: {
      default: '1.375rem 1.375rem 0 0',
      [breakpoints.sm]: radii.xxl,
    },
    backgroundColor: colors.panel,
    color: colors.textLight,
  },
  sheetClosed: {
    display: { default: 'none', [breakpoints.sm]: 'flex' },
  },
  grabber: {
    display: { default: 'block', [breakpoints.sm]: 'none' },
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.borderStrong,
  },
  heading: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  title: {
    fontSize: { default: '1.25rem', [breakpoints.sm]: '0.8125rem' },
    fontWeight: 600,
    letterSpacing: { default: '-0.01em', [breakpoints.sm]: null },
    color: { default: colors.textLight, [breakpoints.sm]: colors.textSubtle },
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: { default: '0.875rem', [breakpoints.sm]: '0.75rem' },
    listStyle: 'none',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    minHeight: '2.75rem',
  },
  itemError: {
    marginInline: '-0.625rem',
    paddingBlock: '0.375rem',
    paddingInline: '0.625rem 0.25rem',
    borderRadius: radii.xl,
    backgroundColor: colors.dangerSoft,
  },
  preview: {
    flexShrink: 0,
    width: { default: '3rem', [breakpoints.sm]: '2.25rem' },
    height: { default: '3rem', [breakpoints.sm]: '2.25rem' },
    borderRadius: radii.sm,
    objectFit: 'cover',
    backgroundColor: colors.raised,
  },
  previewFaded: {
    opacity: 0.55,
  },
  itemBody: {
    flexGrow: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  itemLine: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.75rem',
    fontSize: { default: '0.875rem', [breakpoints.sm]: '0.8125rem' },
  },
  fileName: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  status: {
    flexShrink: 0,
    color: colors.textSubtle,
    fontVariantNumeric: 'tabular-nums',
  },
  statusDone: {
    color: colors.positive,
  },
  errorText: {
    marginTop: '-0.25rem',
    fontSize: '0.8125rem',
    color: colors.dangerSoftText,
  },
  track: {
    height: 4,
    borderRadius: radii.full,
    overflow: 'hidden',
    backgroundColor: colors.control,
  },
  bar: (progress: number) => ({
    width: `${Math.round(progress * 100)}%`,
    height: '100%',
    borderRadius: radii.full,
    backgroundColor: colors.highlight,
    transitionProperty: 'width',
    transitionDuration: '200ms',
  }),
  barDone: {
    backgroundColor: colors.positive,
  },
  dismiss: {
    color: colors.dangerSoftText,
  },
  sheetActions: {
    display: { default: 'grid', [breakpoints.sm]: 'none' },
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '0.625rem',
    paddingTop: '0.25rem',
  },
});
