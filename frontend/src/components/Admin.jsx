import { useAuth0 } from '@auth0/auth0-react';
import Button from './Button';
import PhotoList from './PhotoList';
import PhotoUploader from './PhotoUploader';

export default function Admin() {
    const { isAuthenticated, logout } = useAuth0();

    return (
        <div>
            <div className="flex justify-end p-4">
                <Button className="bg-red-600 items-center" onButtonClick={logout}>
                    Log out
                </Button>
            </div>
            <PhotoUploader />
            <PhotoList isAuthenticated={isAuthenticated} />
        </div>
    );
}
