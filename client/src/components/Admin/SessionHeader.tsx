import * as stylex from '@stylexjs/stylex';
import { LogOut } from 'react-feather';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/src/api/supabase';
import { SiteHeader } from '@/src/components/ui';
import { colors } from '@/src/styles/tokens.stylex';

/** The site header, labelled for the admin page, with a sign-out action. */
export function SessionHeader() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Failed to sign out', error);
      return;
    }
    await navigate('/');
  };

  return (
    <SiteHeader label="Admin">
      <button
        type="button"
        onClick={handleLogout}
        {...stylex.props(styles.signOut)}
      >
        <LogOut size={16} aria-hidden />
        Sign out
      </button>
    </SiteHeader>
  );
}

const styles = stylex.create({
  signOut: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    height: '2.75rem',
    paddingInline: '0.75rem',
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
});
