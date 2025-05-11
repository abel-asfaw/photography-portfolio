import { Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Admin } from '@/src/components/Admin';
import { AuthGuard } from '@/src/components/AuthGuard';
import { Footer } from '@/src/components/Footer';
import { PhotoList } from '@/src/components/PhotoList';

export const queryClient = new QueryClient();

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route index path="/" element={<PhotoList />} />
          <Route path="/admin" element={<AuthGuard component={Admin} />} />
        </Routes>
        <Footer />
      </QueryClientProvider>
    </div>
  );
}
