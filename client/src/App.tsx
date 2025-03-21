import { Route, Routes } from 'react-router-dom';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Admin from '@/src/components/Admin';
import AuthGuard from '@/src/components/AuthGuard';
import PhotoList from '@/src/components/PhotoList';

const queryClient = new QueryClient();

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Routes>
                <Route index path="/" element={<PhotoList />} />
                <Route
                    path="/admin"
                    element={<AuthGuard component={Admin} />}
                />
            </Routes>
        </QueryClientProvider>
    );
}
