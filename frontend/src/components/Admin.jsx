import { useAuth0 } from '@auth0/auth0-react';
import PhotoList from './PhotoList';
import PhotoUploader from './PhotoUploader';
import SessionBar from './SessionBar';

export default function Admin() {
    const { isAuthenticated } = useAuth0();

    return (
        <div className="text-white">
            <SessionBar />
            <PhotoUploader />
            <PhotoList isAuthenticated={isAuthenticated} />
        </div>
    );
}
