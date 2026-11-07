/**
 * Fits a wanted order to the current items: items that are gone are
 * dropped, and ones the wanted order lacks (added since it was made) keep
 * their current order at the end.
 */
export const reconcileOrder = <T extends { id: string }>(
  wanted: T[],
  current: T[],
) => {
  const currentIds = new Set(current.map(item => item.id));
  const kept = wanted.filter(item => currentIds.has(item.id));
  const keptIds = new Set(kept.map(item => item.id));
  return [...kept, ...current.filter(item => !keptIds.has(item.id))];
};
