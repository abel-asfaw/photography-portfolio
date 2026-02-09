import { useAuth0 } from '@auth0/auth0-react';

import { PhotoList, PhotoUploader } from '@/src/components/Photos';
import { SessionHeader } from '@/src/components/Admin';

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
