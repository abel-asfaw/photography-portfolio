import { LogOut } from 'react-feather';

import { useAuth0 } from '@auth0/auth0-react';

import Button from '@/src/components/Button';

export default function SessionHeader() {
    const { logout } = useAuth0();

    const handleLogout = async () => {
        await logout({ logoutParams: { returnTo: window.location.origin } });
    };

    return (
        <div className="flex justify-end border-b border-zinc-800 p-4">
            <Button className="text-white" danger onClick={handleLogout}>
                <LogOut size={16} />
            </Button>
        </div>
    );
}
