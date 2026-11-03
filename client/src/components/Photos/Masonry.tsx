import * as stylex from '@stylexjs/stylex';
import { Children, type ReactNode, useSyncExternalStore } from 'react';

import { breakpoints } from '@/src/styles/tokens.stylex';

// The same `lg` and `sm` media queries the styles use, without `@media`.
const queries = [breakpoints.lg, breakpoints.sm].map(query =>
  query.replace(/^@media\s+/, ''),
);

const subscribe = (onChange: () => void) => {
  if (typeof window.matchMedia !== 'function') return () => {};
  const lists = queries.map(query => window.matchMedia(query));
  lists.forEach(list => list.addEventListener('change', onChange));
  return () =>
    lists.forEach(list => list.removeEventListener('change', onChange));
};

const getColumnCount = () => {
  if (typeof window.matchMedia !== 'function') return 1;
  if (window.matchMedia(queries[0]).matches) return 4;
  if (window.matchMedia(queries[1]).matches) return 3;
  return 2;
};

interface MasonryProps {
  children: ReactNode;
}

/**
 * Lays children out in columns that keep each photo's own shape. Children
 * are dealt into columns in turn rather than filling one column at a time,
 * so the saved order still reads left to right.
 */
export function Masonry({ children }: MasonryProps) {
  const columnCount = useSyncExternalStore(subscribe, getColumnCount);
  const columns = Array.from({ length: columnCount }, () => [] as ReactNode[]);
  Children.toArray(children).forEach((child, i) =>
    columns[i % columnCount].push(child),
  );

  return (
    <div {...stylex.props(styles.masonry)}>
      {columns.map((column, i) => (
        <div key={i} {...stylex.props(styles.column)}>
          {column}
        </div>
      ))}
    </div>
  );
}

const styles = stylex.create({
  masonry: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: '90rem',
    marginInline: 'auto',
    gap: {
      default: '0.625rem',
      [breakpoints.sm]: '1.5rem',
      [breakpoints.lg]: '2rem',
    },
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0',
    minWidth: 0,
    gap: {
      default: '0.625rem',
      [breakpoints.sm]: '1.5rem',
      [breakpoints.lg]: '2rem',
    },
  },
});
