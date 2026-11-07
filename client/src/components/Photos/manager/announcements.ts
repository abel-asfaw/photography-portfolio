import type { Plugins } from '@dnd-kit/abstract';
import { Accessibility } from '@dnd-kit/dom';
import { isSortable } from '@dnd-kit/dom/sortable';

type Announcements = NonNullable<
  NonNullable<ConstructorParameters<typeof Accessibility>[1]>['announcements']
>;
type Source = Parameters<Announcements['dragstart']>[0]['operation']['source'];

/** The photo's 1-based position when the drag started, and now. */
const positions = (source: Source) =>
  source && isSortable(source)
    ? { from: source.initialIndex + 1, at: source.index + 1 }
    : undefined;

/**
 * Screen-reader announcements that name photos by position rather than by
 * id, which dnd-kit's defaults would read out as a UUID.
 */
const photoAnnouncements = (total: number): Announcements => ({
  dragstart: ({ operation }) => {
    const p = positions(operation.source);
    return p && `Picked up photo ${p.from}.`;
  },
  dragover: ({ operation }) => {
    const p = positions(operation.source);
    return p && `Photo ${p.from} is at position ${p.at} of ${total}.`;
  },
  dragend: ({ operation, canceled }) => {
    const p = positions(operation.source);
    if (!p) return undefined;
    return canceled
      ? `Moving photo ${p.from} was cancelled.`
      : `Photo ${p.from} was moved to position ${p.at}.`;
  },
});

/** Swaps the default accessibility plugin for one with photo announcements. */
export const withPhotoAnnouncements =
  (total: number) =>
  (defaults: Plugins): Plugins =>
    defaults.map(plugin =>
      plugin === Accessibility
        ? Accessibility.configure({ announcements: photoAnnouncements(total) })
        : plugin,
    );
