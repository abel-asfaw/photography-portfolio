import * as stylex from '@stylexjs/stylex';
import { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';

import { breakpoints, colors } from '@/src/styles/tokens.stylex';

interface SiteHeaderProps extends PropsWithChildren {
  /** The muted text beside the name. */
  label?: string;
  /**
   * Keeps the header opaque at every width, for pages whose content
   * scrolls under it. The gallery leaves it clear on wide screens.
   */
  solid?: boolean;
}

/** The name header shared by every page; `children` sit at the far end. */
export function SiteHeader({
  label = 'Photography',
  solid = false,
  children,
}: SiteHeaderProps) {
  return (
    <header {...stylex.props(styles.header, solid && styles.solid)}>
      <div {...stylex.props(styles.title)}>
        <h1 {...stylex.props(styles.name)}>
          <Link to="/" {...stylex.props(styles.home)}>
            Abel Asfaw
          </Link>
        </h1>
        <span {...stylex.props(styles.label)}>{label}</span>
      </div>
      {children ? (
        <div {...stylex.props(styles.actions)}>{children}</div>
      ) : null}
    </header>
  );
}

const styles = stylex.create({
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    minHeight: { default: '3.75rem', [breakpoints.sm]: '5rem' },
    paddingBlock: '0.5rem',
    paddingInline: { default: '1rem', [breakpoints.sm]: '3rem' },
    backgroundColor: {
      default: 'rgb(10 10 10 / 0.7)',
      [breakpoints.sm]: 'transparent',
    },
    backdropFilter: { default: 'blur(12px)', [breakpoints.sm]: 'none' },
  },
  solid: {
    backgroundColor: 'rgb(10 10 10 / 0.85)',
    backdropFilter: 'blur(12px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '0.75rem',
  },
  name: {
    fontSize: { default: '1.0625rem', [breakpoints.sm]: '1.125rem' },
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: colors.textLight,
  },
  home: {
    color: { default: null, ':hover': colors.white },
  },
  label: {
    fontSize: { default: '0.8125rem', [breakpoints.sm]: '0.875rem' },
    color: colors.textCaption,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
});
