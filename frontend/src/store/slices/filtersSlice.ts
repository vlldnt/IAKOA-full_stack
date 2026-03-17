import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// ── Types ────────────────────────────────────────────────────────────────────

export interface FilterState {
  keyword: string;
  city: string;
  latitude?: number;
  longitude?: number;
  radius: number;
  selectedCategories: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  isFree: boolean;
  isReady: boolean;
}

// ── État initial ─────────────────────────────────────────────────────────────

const initialState: FilterState = {
  keyword: '',
  city: '',
  latitude: undefined,
  longitude: undefined,
  radius: 5,
  selectedCategories: [],
  dateFrom: undefined,
  dateTo: undefined,
  priceMin: undefined,
  priceMax: undefined,
  isFree: false,
  isReady: false,
};

// ── Slice ────────────────────────────────────────────────────────────────────
// Gère l'état global des filtres de recherche (mots-clés, ville, rayon, catégories, etc.)
// Chaque reducer met à jour un aspect spécifique des filtres

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Met à jour le mot-clé de recherche
    setKeyword(state, action: PayloadAction<string>) {
      state.keyword = action.payload;
    },

    // Met à jour la ville et optionnellement les coordonnées
    setCity(state, action: PayloadAction<{ city: string; lat?: number; lon?: number }>) {
      state.city = action.payload.city;
      if (action.payload.lat !== undefined) state.latitude = action.payload.lat;
      if (action.payload.lon !== undefined) state.longitude = action.payload.lon;
    },

    // Met à jour le rayon de recherche en km
    setRadius(state, action: PayloadAction<number>) {
      state.radius = action.payload;
    },

    // Met à jour les catégories sélectionnées
    setCategories(state, action: PayloadAction<string[]>) {
      state.selectedCategories = action.payload;
    },

    // Met à jour la position GPS de l'utilisateur et active les filtres
    setPosition(state, action: PayloadAction<{ lat: number; lon: number }>) {
      state.latitude = action.payload.lat;
      state.longitude = action.payload.lon;
      state.isReady = true;
    },

    // Met à jour la plage de dates
    setDateRange(state, action: PayloadAction<{ dateFrom?: string; dateTo?: string }>) {
      state.dateFrom = action.payload.dateFrom;
      state.dateTo = action.payload.dateTo;
    },

    // Met à jour les filtres de prix
    setPrice(state, action: PayloadAction<{ priceMin?: number; priceMax?: number; isFree?: boolean }>) {
      state.priceMin = action.payload.priceMin;
      state.priceMax = action.payload.priceMax;
      state.isFree = action.payload.isFree ?? false;
    },

    // Réinitialise tous les filtres à leur valeur par défaut
    resetFilters() {
      return initialState;
    },
  },
});

export const {
  setKeyword,
  setCity,
  setRadius,
  setCategories,
  setPosition,
  setDateRange,
  setPrice,
  resetFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
