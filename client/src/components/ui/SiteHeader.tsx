import * as stylex from '@stylexjs/stylex';
import { type PropsWithChildren, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { breakpoints, colors } from '@/src/styles/tokens.stylex';

interface SiteHeaderProps extends PropsWithChildren {
  /** The muted text beside the name. */
  label?: string;
  /** Slides the header away while scrolling down, back on scrolling up. */
  hideOnScroll?: boolean;
}

// Scrolls shorter than this are ignored, so a trackpad's jitter or iOS's
// bounce doesn't flicker the header.
const SCROLL_SLACK = 8;
// Near the top of the page the header always shows.
const SHOW_ABOVE = 80;

/** Whether the page has been scrolled down since it was last scrolled up. */
function useScrolledDown(enabled: boolean) {
  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < SHOW_ABOVE) {
        setDown(false);
        last = y;
      } else if (Math.abs(y - last) >= SCROLL_SLACK) {
        setDown(y > last);
        last = y;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      setDown(false);
    };
  }, [enabled]);

  return down;
}

/** The name header shared by every page; `children` sit at the far end. */
export function SiteHeader({
  label = 'Photography',
  hideOnScroll = false,
  children,
}: SiteHeaderProps) {
  const hidden = useScrolledDown(hideOnScroll);

  return (
    <header
      data-hidden={hidden || undefined}
      {...stylex.props(styles.header, hidden && styles.hidden)}
    >
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
    backgroundColor: `color-mix(in srgb, ${colors.page} 85%, transparent)`,
    backdropFilter: 'blur(12px)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.borderSubtle,
    transitionProperty: 'translate',
    transitionDuration: {
      default: '250ms',
      '@media (prefers-reduced-motion: reduce)': '0s',
    },
    transitionTimingFunction: 'ease-out',
  },
  // Stays in place while it holds focus, so tabbing to a link shows it.
  hidden: {
    translate: { default: '0 -100%', ':focus-within': null },
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
