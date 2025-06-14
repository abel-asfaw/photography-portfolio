import { useAuth0 } from '@auth0/auth0-react';

import { PhotoList } from '@/src/components/PhotoList';
import { PhotoUploader } from '@/src/components/PhotoUploader';
import { SessionHeader } from '@/src/components/SessionHeader';

export function Admin() {
  const { isAuthenticated } = useAuth0();

  return (
    <>
      <SessionHeader />
      <PhotoUploader />
      <PhotoList isAuthenticated={isAuthenticated} />
    </>
  );
}
