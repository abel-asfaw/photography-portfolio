import { useSession } from '@/src/api/supabase';
import { PhotoList, PhotoUploader } from '@/src/components/Photos';

import { SessionHeader } from './SessionHeader';

export function Admin() {
  const isAuthenticated = useSession(state => !!state.session);

  return (
    <>
      <SessionHeader />
      <PhotoUploader />
      <PhotoList isAuthenticated={isAuthenticated} />
    </>
  );
}
