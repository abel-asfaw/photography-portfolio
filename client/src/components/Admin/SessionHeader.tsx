import * as stylex from '@stylexjs/stylex';
import { ArrowUpRight, LogOut } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';

import { signOut } from '@/src/api/supabase';
import { Button, SiteHeader } from '@/src/components/ui';
import { shared } from '@/src/styles/shared';
import { breakpoints, colors, radii } from '@/src/styles/tokens.stylex';

/**
 * The site header, labelled for the admin page, with a link back to the
 * public gallery and a sign-out action. Labels are icon-only on a phone.
 */
export function SessionHeader() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Failed to sign out', error);
      return;
    }
    await navigate('/');
  };

  return (
    <SiteHeader label="Editor">
      <Link
        to="/"
        aria-label="View site"
        {...stylex.props(styles.link, shared.focusRing, styles.action)}
      >
        <span {...stylex.props(styles.label)}>View site</span>
        <ArrowUpRight size={16} aria-hidden />
      </Link>
      <Button
        variant="ghost"
        aria-label="Sign out"
        onClick={handleLogout}
        xstyle={styles.action}
      >
        <LogOut size={16} aria-hidden />
        <span {...stylex.props(styles.label)}>Sign out</span>
      </Button>
    </SiteHeader>
  );
}

const styles = stylex.create({
  // Matches the ghost Button beside it.
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    color: { default: colors.textSubtle, ':hover': colors.white },
    backgroundColor: { default: 'transparent', ':hover': colors.hoverWash },
    transitionProperty: 'background-color, color',
    transitionDuration: '150ms',
    outlineOffset: 2,
  },
  // A pill, icon-only on a phone.
  action: {
    minWidth: '2.75rem',
    height: '2.75rem',
    paddingInline: { default: 0, [breakpoints.sm]: '0.75rem' },
    borderRadius: radii.full,
    fontSize: '0.875rem',
    fontWeight: 400,
  },
  label: {
    display: { default: 'none', [breakpoints.sm]: 'inline' },
  },
});
