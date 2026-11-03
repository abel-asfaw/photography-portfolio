import { PhotoManager } from '@/src/components/Photos';

import { SessionHeader } from './SessionHeader';

export function Admin() {
  return (
    <>
      <SessionHeader />
      <PhotoManager />
    </>
  );
}
