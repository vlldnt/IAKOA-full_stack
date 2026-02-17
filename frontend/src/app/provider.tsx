import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import { EventProvider } from '@/features/events_page/EventContext';
import { FilterProvider } from '@/features/events_page/FilterContext';

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <FilterProvider>
            <EventProvider>{children}</EventProvider>
          </FilterProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
