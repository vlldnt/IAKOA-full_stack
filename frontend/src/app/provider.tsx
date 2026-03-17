import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';

type AppProviderProps = {
  children: React.ReactNode;
};

// Fournisseur principal de l'application
// Encapsule le store Redux et le routeur React Router
export function AppProvider({ children }: AppProviderProps) {
  return (
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
}
