import { useAuth0 } from '@auth0/auth0-react';

import { AiOutlineLogout } from 'react-icons/ai';
import Button from './Button';

export default function SessionBar() {
    const { logout } = useAuth0();

    return (
        <div className="flex justify-end border-b border-zinc-800 p-4">
            <Button className="gap-2" danger onButtonClick={logout}>
                Log out <AiOutlineLogout />
            </Button>
        </div>
    );
}
