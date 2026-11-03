import * as stylex from '@stylexjs/stylex';
import { LogOut } from 'react-feather';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/src/api/supabase';
import { Button } from '@/src/components/ui';
import { colors } from '@/src/styles/tokens.stylex';

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
    <div {...stylex.props(styles.header)}>
      <Button
        xstyle={styles.signOut}
        aria-label="Sign out"
        danger
        onClick={handleLogout}
      >
        <LogOut size={16} />
      </Button>
    </div>
  );
}

const styles = stylex.create({
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0.75rem',
    borderBottomWidth: '1px',
    borderBottomStyle: 'solid',
    borderBottomColor: colors.surface,
  },
  signOut: {
    color: colors.white,
    cursor: 'pointer',
  },
});
