import * as stylex from '@stylexjs/stylex';
import { ArrowUpRight, LogOut } from 'react-feather';
import { Link, useNavigate } from 'react-router-dom';

import { signOut } from '@/src/api/supabase';
import { SiteHeader } from '@/src/components/ui';
import { breakpoints, colors } from '@/src/styles/tokens.stylex';

/** The site header, labelled for the admin page, with a link back to the
 * public gallery and a sign-out action. Labels are icon-only on a phone. */
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
    <SiteHeader label="Editor" solid>
      <Link to="/" aria-label="View site" {...stylex.props(styles.action)}>
        <span {...stylex.props(styles.label)}>View site</span>
        <ArrowUpRight size={16} aria-hidden />
      </Link>
      <button
        type="button"
        aria-label="Sign out"
        onClick={handleLogout}
        {...stylex.props(styles.action)}
      >
        <LogOut size={16} aria-hidden />
        <span {...stylex.props(styles.label)}>Sign out</span>
      </button>
    </SiteHeader>
  );
}

const styles = stylex.create({
  action: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    minWidth: '2.75rem',
    height: '2.75rem',
    paddingInline: { default: 0, [breakpoints.sm]: '0.75rem' },
    borderRadius: 9999,
    fontSize: '0.875rem',
    cursor: 'pointer',
    color: { default: colors.textSubtle, ':hover': colors.white },
    backgroundColor: {
      default: 'transparent',
      ':hover': 'rgb(255 255 255 / 0.06)',
    },
    transitionProperty: 'color, background-color',
    transitionDuration: '200ms',
  },
  label: {
    display: { default: 'none', [breakpoints.sm]: 'inline' },
  },
});
