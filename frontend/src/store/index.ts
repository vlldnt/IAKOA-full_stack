import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventsReducer from './slices/eventsSlice';
import filtersReducer from './slices/filtersSlice';

// Configuration du store Redux central
// Combine les reducers d'authentification, d'événements et de filtres
export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    filters: filtersReducer,
  },
});

// Types pour le typage TypeScript des hooks Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
