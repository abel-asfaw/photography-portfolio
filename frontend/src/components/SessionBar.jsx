import { useAuth0 } from '@auth0/auth0-react';

import { IoIosExit } from 'react-icons/io';
import Button from './Button';

export default function SessionBar() {
    const { logout } = useAuth0();

    return (
        <div className="flex justify-end border-b border-zinc-800 p-4">
            <Button danger onButtonClick={logout}>
                <IoIosExit size={24} />
            </Button>
        </div>
    );
}
