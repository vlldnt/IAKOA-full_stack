import type { EventType } from "@/lib/types/EventType";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

// Interface pour la réponse paginée
export interface PaginatedEventsResponse {
  data: EventType[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Récupère tous les événements publics
export async function fetchAllEvents(): Promise<EventType[]> {
  const res = await fetch(`${API_BASE_URL}/events`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.statusText}`);
  }

  return await res.json();
}

// Interface pour les paramètres de filtrage
export interface EventFilterParams {
  page?: number;
  limit?: number;
  keyword?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  priceMin?: number;
  priceMax?: number;
  isFree?: boolean;
}

// Récupère les événements avec pagination et filtres
export async function fetchEventsPaginated(
  page: number = 1,
  limit: number = 12,
  filters?: EventFilterParams,
): Promise<PaginatedEventsResponse> {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  // Ajouter les paramètres de filtrage s'ils existent
  if (filters?.keyword) {
    params.append("keyword", filters.keyword);
  }
  if (filters?.latitude !== undefined) {
    params.append("latitude", String(filters.latitude));
  }
  if (filters?.longitude !== undefined) {
    params.append("longitude", String(filters.longitude));
  }
  if (filters?.radius !== undefined) {
    params.append("radius", String(filters.radius));
  }
  if (filters?.categories && filters.categories.length > 0) {
    params.append("categories", filters.categories.join(","));
  }
  if (filters?.dateFrom) {
    params.append("dateFrom", filters.dateFrom);
  }
  if (filters?.dateTo) {
    params.append("dateTo", filters.dateTo);
  }
  if (filters?.priceMin !== undefined) {
    params.append("priceMin", String(filters.priceMin));
  }
  if (filters?.priceMax !== undefined) {
    params.append("priceMax", String(filters.priceMax));
  }
  if (filters?.isFree) {
    params.append("isFree", "true");
  }

  const res = await fetch(`${API_BASE_URL}/events?${params}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.statusText}`);
  }

  return await res.json();
}

// Récupère un événement par ID (public)
export async function fetchEventById(id: string): Promise<EventType> {
  const res = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch event: ${res.statusText}`);
  }

  return await res.json();
}

// Récupère tous les événements de l'utilisateur connecté
export async function fetchMyEvents(): Promise<EventType[]> {
  const res = await fetch(`${API_BASE_URL}/events/my-events`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch my events: ${res.statusText}`);
  }

  return await res.json();
}

// Crée un nouvel événement
export async function createEvent(
  eventData: Omit<EventType, "id">,
): Promise<EventType> {
  const res = await fetch(`${API_BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to create event: ${res.statusText}`,
    );
  }

  return await res.json();
}

// Met à jour un événement
export async function updateEvent(
  id: string,
  eventData: Partial<EventType>,
): Promise<EventType> {
  const res = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(eventData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to update event: ${res.statusText}`,
    );
  }

  return await res.json();
}

// Supprime un événement
export async function deleteEvent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/events/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Failed to delete event: ${res.statusText}`,
    );
  }
}
