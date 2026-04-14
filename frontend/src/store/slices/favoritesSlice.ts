import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as favoritesService from '@/lib/services/favoritesService';

// ── Types ─────────────────────────────────────────────────────────────────────

interface FavoritesState {
  ids: string[];          // IDs des événements favoris
  isLoading: boolean;
  error: string | null;
}

// ── État initial ──────────────────────────────────────────────────────────────

const initialState: FavoritesState = {
  ids: [],
  isLoading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

// Charge les IDs favoris au login
export const fetchFavorites = createAsyncThunk<string[], string>(
  'favorites/fetch',
  async (userId) => favoritesService.fetchFavoriteIds(userId)
);

// Bascule un favori (optimiste : maj immédiate de l'UI, rollback si erreur)
export const toggleFavorite = createAsyncThunk<
  { eventId: string; added: boolean },
  { userId: string; eventId: string; currentlyFavorited: boolean }
>(
  'favorites/toggle',
  async ({ userId, eventId, currentlyFavorited }) => {
    if (currentlyFavorited) {
      await favoritesService.removeFavorite(userId, eventId);
    } else {
      await favoritesService.addFavorite(userId, eventId);
    }
    return { eventId, added: !currentlyFavorited };
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    // Réinitialise les favoris à la déconnexion
    clearFavorites(state) {
      state.ids = [];
      state.error = null;
    },
    // Mise à jour optimiste avant la réponse API
    optimisticToggle(state, action: { payload: { eventId: string; add: boolean } }) {
      const { eventId, add } = action.payload;
      if (add) {
        if (!state.ids.includes(eventId)) state.ids.push(eventId);
      } else {
        state.ids = state.ids.filter((id) => id !== eventId);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.ids = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchFavorites.rejected, (state) => {
        state.isLoading = false;
        // Silencieux — pas d'erreur visible pour les favoris au chargement
      });

    builder
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { eventId, added } = action.payload;
        if (added) {
          if (!state.ids.includes(eventId)) state.ids.push(eventId);
        } else {
          state.ids = state.ids.filter((id) => id !== eventId);
        }
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        // Rollback : on recharge les IDs depuis le serveur si besoin
        // L'optimisticToggle a déjà bougé l'état, on signale juste l'erreur
        state.error = action.error.message ?? 'Erreur lors de la mise à jour des favoris';
      });
  },
});

export const { clearFavorites, optimisticToggle } = favoritesSlice.actions;
export default favoritesSlice.reducer;
