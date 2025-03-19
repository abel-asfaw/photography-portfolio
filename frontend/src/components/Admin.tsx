import { useAuth0 } from '@auth0/auth0-react';
import PhotoList from '@/src/components/PhotoList';
import PhotoUploader from '@/src/components/PhotoUploader';
import SessionBar from '@/src/components/SessionBar';

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
