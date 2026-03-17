import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { EventType } from '@/lib/types/EventType';
import * as eventsService from '@/lib/services/eventsServices';
import type { EventFilterParams } from '@/lib/services/eventsServices';

// ── Types ────────────────────────────────────────────────────────────────────

interface EventsState {
  events: EventType[];
  selectedEvent: EventType | null;
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  prefetchedPage: number | null;
  prefetchedData: EventType[];
  currentFilters: EventFilterParams | undefined;
}

// ── État initial ─────────────────────────────────────────────────────────────

const initialState: EventsState = {
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  totalPages: 1,
  prefetchedPage: null,
  prefetchedData: [],
  currentFilters: undefined,
};

// ── Helpers ──────────────────────────────────────────────────────────────────

// Attend au minimum 500ms pour afficher le loader (meilleure UX)
async function ensureMinLoadTime(startTime: number) {
  const elapsed = Date.now() - startTime;
  if (elapsed < 500) {
    await new Promise((resolve) => setTimeout(resolve, 500 - elapsed));
  }
}

// Traite la réponse de l'API et retourne les données normalisées
function parseResponse(response: eventsService.PaginatedEventsResponse | EventType[], limit: number) {
  if (Array.isArray(response)) {
    return {
      data: response.slice(0, limit),
      totalPages: Math.ceil(response.length / limit),
    };
  }
  return {
    data: response.data || [],
    totalPages: response.totalPages || 1,
  };
}

// ── Thunks asynchrones ───────────────────────────────────────────────────────

// Récupère tous les événements publics (sans pagination)
export const fetchEvents = createAsyncThunk<EventType[]>(
  'events/fetchAll',
  async () => {
    return await eventsService.fetchAllEvents();
  }
);

// Récupère les événements avec pagination
export const fetchEventsPaginated = createAsyncThunk(
  'events/fetchPaginated',
  async ({ page = 1, limit = 12 }: { page?: number; limit?: number }) => {
    const startTime = Date.now();
    const response = await eventsService.fetchEventsPaginated(page, limit);
    await ensureMinLoadTime(startTime);
    return parseResponse(response, limit);
  }
);

// Récupère les événements avec filtres appliqués
export const fetchFilteredEvents = createAsyncThunk(
  'events/fetchFiltered',
  async ({ page = 1, limit = 12, filters }: { page?: number; limit?: number; filters?: EventFilterParams }) => {
    const startTime = Date.now();
    const response = await eventsService.fetchEventsPaginated(page, limit, filters);
    await ensureMinLoadTime(startTime);
    return { ...parseResponse(response, limit), filters };
  }
);

// Charge plus d'événements pour l'infinite scroll
export const fetchMoreEvents = createAsyncThunk(
  'events/fetchMore',
  async (
    { page, limit = 12 }: { page: number; limit?: number },
    { getState }
  ) => {
    const startTime = Date.now();
    const state = getState() as { events: EventsState };
    const { prefetchedPage, prefetchedData, currentFilters } = state.events;

    // Utiliser les données prefetchées si disponibles
    if (prefetchedPage === page && prefetchedData.length > 0) {
      await ensureMinLoadTime(startTime);
      return { data: prefetchedData, isFromPrefetch: true, totalPages: state.events.totalPages };
    }

    // Sinon charger normalement avec les filtres courants
    const response = await eventsService.fetchEventsPaginated(page, limit, currentFilters);
    await ensureMinLoadTime(startTime);

    if (Array.isArray(response)) {
      const start = (page - 1) * limit;
      return {
        data: response.slice(start, start + limit),
        isFromPrefetch: false,
        totalPages: Math.ceil(response.length / limit),
      };
    }

    return {
      data: response.data || [],
      isFromPrefetch: false,
      totalPages: response.totalPages || 1,
    };
  }
);

// Prefetch la page suivante en arrière-plan pour un chargement instantané
export const prefetchNextPage = createAsyncThunk(
  'events/prefetchNext',
  async (
    { nextPage, limit = 12 }: { nextPage: number; limit?: number },
    { getState }
  ) => {
    const state = getState() as { events: EventsState };
    const { totalPages, prefetchedPage, currentFilters } = state.events;

    // Ne pas prefetch si déjà fait ou au-delà du total
    if (nextPage > totalPages || prefetchedPage === nextPage) return null;

    const response = await eventsService.fetchEventsPaginated(nextPage, limit, currentFilters);
    let data: EventType[] = [];
    if (Array.isArray(response)) {
      const start = (nextPage - 1) * limit;
      data = response.slice(start, start + limit);
    } else {
      data = response.data || [];
    }

    return { page: nextPage, data };
  }
);

// Sélectionne un événement en récupérant ses détails par ID
export const selectEvent = createAsyncThunk<EventType, string>(
  'events/selectById',
  async (id) => {
    return await eventsService.fetchEventById(id);
  }
);

// Crée un nouvel événement (nécessite authentification)
export const createEvent = createAsyncThunk<EventType, Omit<EventType, 'id'>>(
  'events/create',
  async (eventData) => {
    return await eventsService.createEvent(eventData);
  }
);

// Met à jour un événement existant (nécessite authentification)
export const updateEvent = createAsyncThunk<EventType, { id: string; eventData: Partial<EventType> }>(
  'events/update',
  async ({ id, eventData }) => {
    return await eventsService.updateEvent(id, eventData);
  }
);

// Supprime un événement (nécessite authentification)
export const deleteEvent = createAsyncThunk<string, string>(
  'events/delete',
  async (id) => {
    await eventsService.deleteEvent(id);
    return id;
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────
// Gère l'état global des événements : liste, sélection, pagination, CRUD

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    // Sélectionne un événement directement (sans appel API)
    setSelectedEvent(state, action: PayloadAction<EventType | null>) {
      state.selectedEvent = action.payload;
    },

    // Réinitialise l'erreur
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchEvents — tous les événements
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.events = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.error = action.error.message || 'Erreur lors du chargement des événements';
        state.isLoading = false;
      });

    // fetchEventsPaginated — événements paginés
    builder
      .addCase(fetchEventsPaginated.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventsPaginated.fulfilled, (state, action) => {
        state.events = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.isLoading = false;
      })
      .addCase(fetchEventsPaginated.rejected, (state, action) => {
        state.error = action.error.message || 'Erreur lors du chargement des événements';
        state.isLoading = false;
      });

    // fetchFilteredEvents — événements filtrés
    builder
      .addCase(fetchFilteredEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFilteredEvents.fulfilled, (state, action) => {
        state.events = action.payload.data;
        state.totalPages = action.payload.totalPages;
        state.currentFilters = action.payload.filters;
        state.isLoading = false;
      })
      .addCase(fetchFilteredEvents.rejected, (state, action) => {
        state.error = action.error.message || 'Erreur lors du chargement des événements';
        state.isLoading = false;
      });

    // fetchMoreEvents — infinite scroll
    builder
      .addCase(fetchMoreEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMoreEvents.fulfilled, (state, action) => {
        state.events = [...state.events, ...action.payload.data];
        state.totalPages = action.payload.totalPages;
        // Nettoyer le prefetch si utilisé
        if (action.payload.isFromPrefetch) {
          state.prefetchedPage = null;
          state.prefetchedData = [];
        }
        state.isLoading = false;
      })
      .addCase(fetchMoreEvents.rejected, (state, action) => {
        state.error = action.error.message || 'Erreur lors du chargement des événements';
        state.isLoading = false;
      });

    // prefetchNextPage — prefetch silencieux
    builder
      .addCase(prefetchNextPage.fulfilled, (state, action) => {
        if (action.payload) {
          state.prefetchedPage = action.payload.page;
          state.prefetchedData = action.payload.data;
        }
      });

    // selectEvent — sélection d'un événement par ID
    builder
      .addCase(selectEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(selectEvent.fulfilled, (state, action) => {
        state.selectedEvent = action.payload;
        state.isLoading = false;
      })
      .addCase(selectEvent.rejected, (state, action) => {
        state.error = action.error.message || "Erreur lors du chargement de l'événement";
        state.selectedEvent = null;
        state.isLoading = false;
      });

    // createEvent — création d'un événement
    builder
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.events.push(action.payload);
        state.isLoading = false;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.error = action.error.message || "Erreur lors de la création de l'événement";
        state.isLoading = false;
      });

    // updateEvent — mise à jour d'un événement
    builder
      .addCase(updateEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        const updated = action.payload;
        state.events = state.events.map((e) => (e.id === updated.id ? updated : e));
        if (state.selectedEvent?.id === updated.id) {
          state.selectedEvent = updated;
        }
        state.isLoading = false;
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.error = action.error.message || "Erreur lors de la mise à jour de l'événement";
        state.isLoading = false;
      });

    // deleteEvent — suppression d'un événement
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.events = state.events.filter((e) => e.id !== deletedId);
        if (state.selectedEvent?.id === deletedId) {
          state.selectedEvent = null;
        }
        state.isLoading = false;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.error = action.error.message || "Erreur lors de la suppression de l'événement";
        state.isLoading = false;
      });
  },
});

export const { setSelectedEvent, clearError } = eventsSlice.actions;
export default eventsSlice.reducer;
