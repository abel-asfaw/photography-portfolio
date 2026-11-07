/** Positions read as two digits, like a contact sheet: 01, 02, … */
export const formatPosition = (position: number) =>
  String(position).padStart(2, '0');

/** A count with its noun: "1 photo", "3 photos". */
export const plural = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;
