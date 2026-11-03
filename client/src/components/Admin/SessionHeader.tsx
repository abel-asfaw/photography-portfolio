import { LogOut } from 'react-feather';
import { useNavigate } from 'react-router-dom';

import { supabase } from '@/src/api/supabase';
import { Button } from '@/src/components/ui';

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
    <div className="flex justify-end border-b border-zinc-800 p-3">
      <Button
        className="text-white hover:cursor-pointer"
        aria-label="Sign out"
        danger
        onClick={handleLogout}
      >
        <LogOut size={16} />
      </Button>
    </div>
  );
}
