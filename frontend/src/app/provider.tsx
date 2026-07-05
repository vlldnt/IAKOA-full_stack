import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/features/auth/AuthContext';
import { FilterProvider } from '@/features/events_page/FilterContext';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { ToastProvider } from '@/components/ui/toast';

type AppProviderProps = {
  children: React.ReactNode;
};

// L'état serveur (événements, favoris…) est géré par TanStack Query ;
// les contextes React ne portent que l'état client (auth, filtres UI).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProvider({ children }: AppProviderProps) {
  return (
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <FilterProvider>
                <ToastProvider>{children}</ToastProvider>
              </FilterProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>
  );
}
