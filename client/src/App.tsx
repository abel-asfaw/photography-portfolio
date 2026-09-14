import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';

import { Admin, AuthGuard } from '@/src/components/Admin';
import { PhotoList } from '@/src/components/Photos';
import { Footer } from '@/src/components/ui';

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
