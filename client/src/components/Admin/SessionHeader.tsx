import { LogOut } from 'react-feather';

import { useAuth0 } from '@auth0/auth0-react';

import { Button } from '@/src/components/ui';

export function SessionHeader() {
  const { logout } = useAuth0();

  const handleLogout = async () => {
    await logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="flex justify-end border-b border-zinc-800 p-3">
      <Button
        className="text-white hover:cursor-pointer"
        danger
        onClick={handleLogout}
      >
        <LogOut size={16} />
      </Button>
    </div>
  );
}
