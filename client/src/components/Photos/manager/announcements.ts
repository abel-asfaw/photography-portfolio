import type { Announcements, UniqueIdentifier } from '@dnd-kit/core';

/**
 * Screen-reader announcements that name photos by position rather than by
 * id, which dnd-kit's defaults would read out as a UUID. `ids` is the order
 * when the drag started, which holds until the drop.
 */
export const photoAnnouncements = (ids: string[]): Announcements => {
  const at = (id: UniqueIdentifier) => ids.indexOf(String(id)) + 1;
  return {
    onDragStart: ({ active }) => `Picked up photo ${at(active.id)}.`,
    onDragOver: ({ active, over }) =>
      over
        ? `Photo ${at(active.id)} is over position ${at(over.id)} of ${ids.length}.`
        : `Photo ${at(active.id)} is no longer over a position.`,
    onDragEnd: ({ active, over }) =>
      over
        ? `Photo ${at(active.id)} was moved to position ${at(over.id)}.`
        : `Photo ${at(active.id)} was dropped.`,
    onDragCancel: ({ active }) =>
      `Moving photo ${at(active.id)} was cancelled. It is back at position ${at(active.id)}.`,
  };
};
