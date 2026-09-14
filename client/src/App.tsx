import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';

import { queryClient } from '@/src/api/queryClient';
import { Admin, withAuthGuard } from '@/src/components/Admin';
import { PhotoList } from '@/src/components/Photos';
import { Footer } from '@/src/components/ui';

const ProtectedAdmin = withAuthGuard(Admin);

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route index path="/" element={<PhotoList />} />
          <Route path="/admin" element={<ProtectedAdmin />} />
        </Routes>
        <Footer />
      </QueryClientProvider>
    </div>
  );
}
