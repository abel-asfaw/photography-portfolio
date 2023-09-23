import { useEffect } from 'react';
import PhotoUploader from './components/PhotoUploader';
import PhotoList from './components/PhotoList';
import usePhotosContext from './hooks/usePhotosContext';
import { useAuth0 } from '@auth0/auth0-react';
import Button from './components/Button';

export default function App() {
    const { fetchPhotosAndSync } = usePhotosContext();
    const { loginWithRedirect, logout, isAuthenticated } = useAuth0();

    useEffect(() => {
        fetchPhotosAndSync();
    }, [fetchPhotosAndSync]);

    return (
        <div>
            <div className="flex justify-end p-4">
                <div className="opacity-0 hover:opacity-100">
                    {isAuthenticated ? (
                        <Button className="bg-red-600" onButtonClick={logout}>
                            Log out
                        </Button>
                    ) : (
                        <Button
                            className="bg-green-600"
                            onButtonClick={loginWithRedirect}
                        >
                            Log in
                        </Button>
                    )}
                </div>
            </div>
            {isAuthenticated && <PhotoUploader />}
            <PhotoList />
        </div>
    );
}
