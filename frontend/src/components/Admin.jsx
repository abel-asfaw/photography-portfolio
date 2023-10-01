import { useAuth0 } from '@auth0/auth0-react';
import Button from './Button';
import PhotoList from './PhotoList';
import PhotoUploader from './PhotoUploader';
import { AiOutlineLogout } from 'react-icons/ai';

export default function Admin() {
    const { isAuthenticated, logout } = useAuth0();

    return (
        <div>
            <div className="flex justify-end p-4">
                <Button danger className="text-white gap-1" onButtonClick={logout}>
                    Log out
                    <AiOutlineLogout />
                </Button>
            </div>
            <PhotoUploader />
            <PhotoList isAuthenticated={isAuthenticated} />
        </div>
    );
}
