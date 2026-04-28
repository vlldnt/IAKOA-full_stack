import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '@/store';

type AppProviderProps = {
  children: React.ReactNode;
};

export function AppProvider({ children }: AppProviderProps) {
  return (
    <StrictMode>
      <Provider store={store}>
        <BrowserRouter basename="/iakoa-app">
          {children}
        </BrowserRouter>
      </Provider>
    </StrictMode>
  );
}
