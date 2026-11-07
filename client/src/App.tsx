import * as stylex from '@stylexjs/stylex';
import { QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';

import { queryClient } from '@/src/api/queryClient';
import { Admin, withAuthGuard } from '@/src/components/Admin';
import { PhotoList } from '@/src/components/Photos';
import { Footer, SiteHeader } from '@/src/components/ui';

const ProtectedAdmin = withAuthGuard(Admin);

export default function App() {
  return (
    <div {...stylex.props(styles.app)}>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            index
            path="/"
            element={
              <>
                <SiteHeader hideOnScroll />
                <PhotoList />
                <Footer />
              </>
            }
          />
          <Route path="/admin" element={<ProtectedAdmin />} />
        </Routes>
      </QueryClientProvider>
    </div>
  );
}

const styles = stylex.create({
  app: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
});
